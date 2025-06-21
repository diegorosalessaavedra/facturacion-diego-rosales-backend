import { NotasComprobante } from '../modules/comprobantes/filesNotasComprobante/notasComprobante/notasComprobante.model.js';
import { AppError } from './AppError.js';

const COMPROBANTE_TYPES = {
  NOTA_CREDITO_FACTURA: {
    tipoDoc: '07',
    name: 'NOTA DE CREDITO',
    comprobante: 'FACTURA ELECTRÓNICA',
    serie: 'FC02',
    url: process.env.LARAVEL_URL + '/api/nota-credito',
  },
  NOTA_CREDITO_BOLETA: {
    tipoDoc: '07',
    name: 'NOTA DE CREDITO',
    comprobante: 'BOLETA DE VENTA',
    serie: 'BC02',
    url: process.env.LARAVEL_URL + '/api/nota-credito',
  },
  NOTA_DEBITO_FACTURA: {
    tipoDoc: '08',
    name: 'NOTA DE DEBITO',
    comprobante: 'FACTURA ELECTRÓNICA',
    serie: 'FD02',
    url: process.env.LARAVEL_URL + '/api/nota-credito',
  },
  NOTA_DEBITO_BOLETA: {
    tipoDoc: '08',
    name: 'NOTA DE DEBITO',
    comprobante: 'BOLETA DE VENTA',
    serie: 'BD02',
    url: process.env.LARAVEL_URL + '/api/nota-credito',
  },
};

export const getNotaSConfig = async (tipo_nota, tipo_comprobante) => {
  const config = Object.values(COMPROBANTE_TYPES).find(
    (type) => type.name === tipo_nota && type.comprobante === tipo_comprobante
  );

  if (!config) {
    throw new AppError(`Tipo de comprobante no válido: ${tipo_nota}`);
  }
  let existingComprobantes = [];

  if (tipo_comprobante === 'FACTURA ELECTRÓNICA') {
    existingComprobantes = await ComprobantesElectronicos.findAll({
      where: {
        tipoComprobante: 'FACTURA ELECTRÓNICA',
        serie: process.env.SERIE_FACTURA,
      },
    });
  } else if (tipo_comprobante === 'BOLETA DE VENTA') {
    existingComprobantes = await ComprobantesElectronicos.findAll({
      where: {
        tipoComprobante: 'BOLETA DE VENTA',
        serie: process.env.SERIE_BOLETA,
      },
    });
  }

  return {
    ...config,
    numeroSerie: existingComprobantes.length + Number(process.env.MAS_NUMERO),
  };
};
