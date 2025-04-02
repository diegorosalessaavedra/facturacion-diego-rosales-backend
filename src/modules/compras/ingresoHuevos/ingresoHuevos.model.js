import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const IngresoHuevos = db.define('ingresoHuevos', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  autorizado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  comprador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codigo_compra: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
  produccion: {
    type: DataTypes.ENUM('SANTA ELENA', 'PRODUCCION PROPIA'),
    allowNull: false,
    defaultValue: 'SANTA ELENA',
  },
});

export { IngresoHuevos };
