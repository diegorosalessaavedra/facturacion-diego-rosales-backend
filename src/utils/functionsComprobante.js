import { ComprobantesElectronicos } from '../modules/comprobantes/filesComprobanteElectronicos/comprobantesElectronicos/comprobantesElectronicos.model.js';
import { AppError } from './AppError.js';
import { XMLParser } from 'fast-xml-parser';

const COMPROBANTE_TYPES = {
  NOTA_VENTA: {
    name: 'NOTA DE VENTA',
    serie: process.env.SERIE_NOTA,
  },

  MERMA: {
    name: 'MERMA',
    serie: process.env.SERIE_MERMA,
  },
  FACTURA: {
    name: 'FACTURA ELECTRÓNICA',
    tipoDoc: '01',
    serie: process.env.SERIE_FACTURA,
    url: `${process.env.LARAVEL_URL}/api/emitir-comprobante`,
  },
  BOLETA: {
    name: 'BOLETA DE VENTA',
    tipoDoc: '03',
    serie: process.env.SERIE_BOLETA,
    url: `${process.env.LARAVEL_URL}/api/emitir-comprobante`,
  },
};

const TASA_IGV = 0.18; // MEJORA: Evita "números mágicos". Fácil de actualizar si la tasa cambia.

// --- Funciones de Utilidad ---

/**
 * Formatea un número con ceros a la izquierda hasta alcanzar una longitud deseada.
 * @param {number | string | null | undefined} number - El número a formatear.
 * @param {number} length - La longitud final del string.
 * @returns {string | null} El número formateado o null si la entrada es nula/indefinida.
 */
export const formatWithLeadingZeros = (number, length) => {
  if (number === null || number === undefined) {
    return null;
  }
  return String(number).padStart(length, '0');
};

/**
 * Valida los campos requeridos en el cuerpo de una solicitud de creación.
 * Lanza un AppError si la validación falla.
 * @param {object} body - El cuerpo de la solicitud (req.body).
 */
export const validateCreateRequest = (body) => {
  const requiredFields = [
    'tipoComprobante',
    'fecEmision',
    'fecVencimiento',
    'clienteId',
    'usuarioId',
    'vendedor',
    'arrayPagos',
    'productos',
  ];

  const missingFields = requiredFields.filter((field) => !(field in body));

  if (missingFields.length > 0) {
    // CORRECCIÓN CRÍTICA: Se debe usar 'throw' para que el error detenga la ejecución.
    throw new AppError(
      `Campos requeridos faltantes: ${missingFields.join(', ')}`,
      400
    );
  }

  if (!Array.isArray(body.productos) || body.productos.length === 0) {
    // CORRECCIÓN CRÍTICA: También necesita 'throw'.
    throw new AppError(
      'El campo "productos" debe ser un array con al menos un elemento.',
      400
    );
  }
};

// --- Funciones de Lógica de Negocio ---

export const calculateTotals = (productos = []) => {
  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + parseFloat(producto.total || 0),
    0
  );

  // MEJORA: Se usa la constante TASA_IGV para mayor claridad y mantenibilidad.
  const totalValorVenta = totalPrecioProductos / (1 + TASA_IGV);
  const totalIgv = totalValorVenta * TASA_IGV;

  return {
    totalPrecioProductos,
    totalValorVenta,
    totalIgv,
  };
};

export const getComprobanteConfig = async (tipoComprobante) => {
  const config = Object.values(COMPROBANTE_TYPES).find(
    (type) => type.name === tipoComprobante
  );

  if (!config) {
    throw new AppError(
      `Tipo de comprobante no válido: ${tipoComprobante}`,
      400
    );
  }
  if (!config.serie) {
    throw new AppError(
      `La serie para "${tipoComprobante}" no está configurada en las variables de entorno.`,
      500
    );
  }

  // MEJORA DE RENDIMIENTO: Usa .count() en lugar de .findAll().
  // Esto es mucho más eficiente, ya que la BD solo devuelve un número, no todos los objetos.
  const cantidadExistente = await ComprobantesElectronicos.count({
    where: {
      tipoComprobante: config.name,
      serie: config.serie,
    },
  });

  // MEJORA: Lógica simplificada para calcular el siguiente número.
  let siguienteNumero;
  if (config.name === 'MERMA') {
    siguienteNumero = cantidadExistente + 1;
  } else {
    const incremento = Number(process.env.MAS_NUMERO) || 0; // Fallback a 0 si no está definido
    siguienteNumero = cantidadExistente + incremento;
  }

  return {
    ...config,
    numeroSerie: siguienteNumero,
  };
};

export const extractDigestValue = (xmlBase64) => {
  if (!xmlBase64) return null;

  try {
    const xmlString = Buffer.from(xmlBase64, 'base64').toString('utf-8');

    // MEJORA DE ROBUSTEZ: Usar un parser de XML es mucho más seguro que RegEx.
    // RegEx puede fallar con simples espacios o cambios en los atributos del XML.
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlString);

    // La ruta exacta puede necesitar ajuste según la estructura de tu XML de respuesta SUNAT.
    // Esta es una ruta común para encontrar el DigestValue.
    const digestValue =
      jsonObj?.['soap-env:Envelope']?.['soap-env:Body']?.[
        'ser:sendBillResponse'
      ]?.['ser:ticket']?.['content']?.['ApplicationResponse']?.[
        'ds:Signature'
      ]?.['ds:SignedInfo']?.['ds:Reference']?.['ds:DigestValue'];

    return digestValue || null;
  } catch (error) {
    console.error('Error al parsear XML o extraer DigestValue:', error);
    return null;
  }
};

/**
 * Genera el contenido para el código QR según el estándar de SUNAT.
 * @param {object} data - Objeto con todos los campos necesarios para el QR.
 * @returns {string} El string con los campos concatenados por '|'.
 */
export const generateQRContent = (data) => {
  const {
    emisorRuc,
    tipoComprobante,
    serie,
    correlativo,
    igv,
    total,
    fecha,
    tipoDocCliente,
    numeroDocCliente,
    digestValue,
  } = data;

  // MEJORA: Se asegura de que todos los campos sean válidos y no causen errores.
  // Los valores nulos o indefinidos se convierten en strings vacíos.
  const fields = [
    emisorRuc,
    tipoComprobante,
    serie,
    correlativo,
    igv?.toFixed(2), // Optional chaining por si igv es null/undefined
    total?.toFixed(2), // Optional chaining por si total es null/undefined
    fecha,
    tipoDocCliente,
    numeroDocCliente,
    digestValue,
  ];

  return fields.map((field) => field ?? '').join('|');
};
