import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const OrdenesCompra = db.define('ordenesCompra', {
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
  comprobanteOrdenCompraId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fechaEmision: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaVencimiento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  moneda: {
    type: DataTypes.ENUM('Soles', 'Dólares Americanos'),
    allowNull: false,
    defaultValue: 'Soles',
  },
  tipoOrdenCompra: {
    type: DataTypes.ENUM(
      'Mercadería',
      'Servicios',
      'Alquileres',
      'Suministros',
      'Otros'
    ),
    allowNull: false,
    defaultValue: 'Mercadería',
  },
  formaPago: {
    type: DataTypes.ENUM('Credito', 'Al Contado'),
    allowNull: false,
    defaultValue: 'Credito',
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

export { OrdenesCompra };
