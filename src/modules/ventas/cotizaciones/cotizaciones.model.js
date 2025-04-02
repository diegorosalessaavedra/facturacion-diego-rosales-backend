import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const Cotizaciones = db.define('cotizaciones', {
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
  comprobanteElectronicoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tipoCotizacion: {
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
  vendedor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipoEnvio: {
    type: DataTypes.ENUM('Aéreo', 'Terrestre', 'Almacen'),
    allowNull: false,
    defaultValue: 'Terrestre',
  },
  fechaEmision: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaEntrega: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  direccionEnvio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  consignatario: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  consignatarioDni: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  consignatarioTelefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  informacionReferencial: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  consignatario2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  consignatarioDni2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  consignatarioTelefono2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  informacionReferencial2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  observacion2: {
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

export { Cotizaciones };
