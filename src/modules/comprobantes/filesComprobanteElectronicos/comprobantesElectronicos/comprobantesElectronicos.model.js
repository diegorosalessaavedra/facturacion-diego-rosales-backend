import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const ComprobantesElectronicos = db.define('comprobantesElectronicos', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  clienteId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  vendedor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  serie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numeroSerie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaEmision: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaVencimiento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipoComprobante: {
    type: DataTypes.ENUM(
      'NOTA DE VENTA',
      'FACTURA ELECTRÓNICA',
      'BOLETA DE VENTA',
      'MERMA'
    ),
    allowNull: false,
  },
  tipoOperacion: {
    type: DataTypes.ENUM('VENTA INTERNA', 'OPERACIÓN SUJETA A DETRACCIÓN'),
    allowNull: false,
  },
  tipo_factura: {
    type: DataTypes.ENUM('VENTA', 'GRATUITA'),
    defaultValue: 'VENTA',
    allowNull: false,
  },

  total_valor_venta: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  total_igv: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  total_venta: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  monto_pendiente: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  legend: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('ACEPTADA', 'RECHAZADA', 'PENDIENTE', 'ANULADO'),
    allowNull: false,
    defaultValue: 'ACEPTADA',
  },

  urlXml: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cdr: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  digestValue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qrContent: { type: DataTypes.TEXT, allowNull: true },

  observacion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export { ComprobantesElectronicos };
