import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const VentasHuevos = db.define('ventasHuevos', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },

  vendedor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_solicitud: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_vencimiento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cliente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  total: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  saldo: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('PAGADO', 'PENDIENTE'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
  },
});

export { VentasHuevos };
