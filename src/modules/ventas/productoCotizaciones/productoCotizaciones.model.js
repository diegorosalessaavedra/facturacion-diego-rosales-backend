import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const ProductoCotizaciones = db.define('productoCotizaciones', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  cotizacionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(20, 5),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
});

export { ProductoCotizaciones };
