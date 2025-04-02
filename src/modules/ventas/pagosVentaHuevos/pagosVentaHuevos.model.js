import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const PagosVentaHuevos = db.define('pagosVentaHuevos', {
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
  metodo_pago_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  operacion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  monto: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  fecha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export { PagosVentaHuevos };
