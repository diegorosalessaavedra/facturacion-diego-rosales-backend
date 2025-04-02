import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const ProductosOrdenCompras = db.define('productosOrdenCompras', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  ordenCompraId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },

  stock: {
    type: DataTypes.DECIMAL(20, 2),
    defaultValue: 0,
    allowNull: false,
  },
});

export { ProductosOrdenCompras };
