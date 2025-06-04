import { ComprobantesElectronicos } from '../modules/comprobantes/filesComprobanteElectronicos/comprobantesElectronicos/comprobantesElectronicos.model.js';
import { AppError } from './AppError.js';

const COMPROBANTE_TYPES = {
  NOTA_VENTA: {
    name: 'NOTA DE VENTA',
    serie: 'NO00',
  },
  FACTURA: {
    tipoDoc: '01',
    name: 'FACTURA ELECTRÓNICA',
    serie: process.env.SERIE_FACTURA,
    url: process.env.LARAVEL_URL + '/api/emitir-comprobante',
  },
  BOLETA: {
    name: 'BOLETA DE VENTA',
    tipoDoc: '03',
    serie: process.env.SERIE_BOLETA,
    url: process.env.LARAVEL_URL + '/api/emitir-comprobante',
  },
};

// Utility functions
export const formatWithLeadingZeros = (number, length) => {
  if (number === null || number === undefined) return null;
  return number.toString().padStart(length, '0');
};

export const validateCreateRequest = (body) => {
  const requiredFields = [
    'tipoComprobante',
    'condicionPago',
    'fecEmision',
    'fecVencimiento',
    'clienteId',
    'usuarioId',
    'vendedor',
    'arrayPagos',
    'productos',
  ];

  const missingFields = requiredFields.filter((field) => !body[field]);
  if (missingFields.length > 0) {
    new AppError(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
  }

  if (!Array.isArray(body.productos) || body.productos.length === 0) {
    new AppError('Se requiere al menos un producto');
  }
};

// Helper functions
export const calculateTotals = (productos) => {
  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + Number(parseFloat(producto.total || 0)),
    0
  );
  const totalValorVenta = Number(totalPrecioProductos / 1.18);

  return {
    totalPrecioProductos: Number(totalPrecioProductos),
    totalValorVenta: totalValorVenta,
    totalIgv: Number(totalValorVenta * 0.18),
  };
};

export const getComprobanteConfig = async (tipoComprobante) => {
  const config = Object.values(COMPROBANTE_TYPES).find(
    (type) => type.name === tipoComprobante
  );

  if (!config) {
    throw new Error(`Tipo de comprobante no válido: ${tipoComprobante}`);
  }

  let existingComprobantes = [];

  if (tipoComprobante === 'FACTURA ELECTRÓNICA') {
    existingComprobantes = await ComprobantesElectronicos.findAll({
      where: {
        tipoComprobante: 'FACTURA ELECTRÓNICA',
        serie: process.env.SERIE_FACTURA,
      },
    });
  } else if (tipoComprobante === 'BOLETA DE VENTA') {
    existingComprobantes = await ComprobantesElectronicos.findAll({
      where: {
        tipoComprobante: 'BOLETA DE VENTA',
        serie: process.env.SERIE_BOLETA,
      },
    });
  } else if (tipoComprobante === 'NOTA DE VENTA') {
    existingComprobantes = await ComprobantesElectronicos.findAll({
      where: {
        tipoComprobante: 'NOTA DE VENTA',
        serie: process.env.SERIE_NOTA,
      },
    });
  }

  return {
    ...config,
    numeroSerie: existingComprobantes.length + Number(process.env.MAS_NUMERO),
  };
};

export const extractDigestValue = (xmlBase64) => {
  try {
    const xmlString = Buffer.from(xmlBase64, 'base64').toString('utf-8');
    const digestMatch = xmlString.match(
      /<ds:DigestValue>(.*?)<\/ds:DigestValue>/
    );
    return digestMatch ? digestMatch[1] : null;
  } catch (error) {
    console.error('Error extracting DigestValue:', error);
    return null;
  }
};

export const generateQRContent = ({
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
}) => {
  return [
    emisorRuc,
    tipoComprobante,
    serie,
    correlativo,
    igv.toFixed(2),
    total.toFixed(2),
    fecha,
    tipoDocCliente,
    numeroDocCliente,
    digestValue,
  ].join('|');
};
