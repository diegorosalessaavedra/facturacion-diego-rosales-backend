import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const MisProductos = db.define('misProductos', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.DECIMAL(20, 2),
    defaultValue: 0,
    allowNull: false,
  },
  codigoSunat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codigoInterno: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codigoCompra: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codigoVenta: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codUnidad: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NIU',
  },
  incluyeIgv: {
    type: DataTypes.ENUM('Si', 'No'),
    allowNull: false,
    defaultValue: 'Si',
  },
  conStock: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export { MisProductos };
