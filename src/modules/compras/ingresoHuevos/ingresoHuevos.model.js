import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const IngresoHuevos = db.define('ingresoHuevos', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  origen_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comprador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codigo_compra: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fecha_pedido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total_precio: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
});

export { IngresoHuevos };
