import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const ComprobantesOrdenCompras = db.define('comprobantesOrdenCompras', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  proveedorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  autorizado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  comprador: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  serie: {
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
      'FACTURA ELECTRÓNICA',
      'BOLETA DE VENTA ELECTRÓNICA',
      'NOTA DE CRÉDITO',
      'NOTA DE ENTRADA',
      'RECIBO POR HONORARIOS'
    ),
    allowNull: false,
    defaultValue: 'FACTURA ELECTRÓNICA',
  },
  moneda: {
    type: DataTypes.ENUM('Soles', 'Dólares Americanos'),
    allowNull: false,
    defaultValue: 'Soles',
  },
  tipoCambio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  saldoInicial: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  saldo: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Activo', 'Anulado'),
    allowNull: false,
    defaultValue: 'Activo',
  },
  estadoPago: {
    type: DataTypes.ENUM('PENDIENTE', 'CANCELADO'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
  },
});

export { ComprobantesOrdenCompras };
