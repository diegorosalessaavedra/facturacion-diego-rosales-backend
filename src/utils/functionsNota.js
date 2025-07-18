import { NotasComprobante } from '../modules/comprobantes/filesNotasComprobante/notasComprobante/notasComprobante.model.js';
import { AppError } from './AppError.js';

const COMPROBANTE_TYPES = {
  NOTA_CREDITO_FACTURA: {
    tipoDoc: '07',
    name: 'NOTA DE CREDITO',
    comprobante: 'FACTURA ELECTRÓNICA',
    serie: 'FC04',
    url: process.env.LARAVEL_URL + '/api/nota-credito',
  },
  NOTA_CREDITO_BOLETA: {
    tipoDoc: '07',
    name: 'NOTA DE CREDITO',
    comprobante: 'BOLETA DE VENTA',
    serie: 'BC04',
    url: process.env.LARAVEL_URL + '/api/nota-credito',
  },
  NOTA_DEBITO_FACTURA: {
    tipoDoc: '08',
    name: 'NOTA DE DEBITO',
    comprobante: 'FACTURA ELECTRÓNICA',
    serie: 'FD04',
    url: process.env.LARAVEL_URL + '/api/nota-credito',
  },
  NOTA_DEBITO_BOLETA: {
    tipoDoc: '08',
    name: 'NOTA DE DEBITO',
    comprobante: 'BOLETA DE VENTA',
    serie: 'BD04',
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

  const existingComprobantes = await NotasComprobante.findAll({
    where: { tipo_nota, tipo_comprobante, serie: config.serie },
  });

  return {
    ...config,
    numeroSerie: existingComprobantes.length + 1,
  };
};
