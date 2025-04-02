import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const Huevos = db.define('huevos', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  ingreso_huevos_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre_producto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zona_venta: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(20, 3),
    allowNull: false,
  },
  precio_sin_igv: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(20, 2),
    defaultValue: 0,
    allowNull: false,
  },
});

export { Huevos };
