import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const ProductosVentaHuevos = db.define('productosVentaHuevos', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  venta_huevos_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  huevo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  paquetes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  planchas: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },

  cantidad: {
    type: DataTypes.DECIMAL(20, 2),

    allowNull: false,
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
});

export { ProductosVentaHuevos };
