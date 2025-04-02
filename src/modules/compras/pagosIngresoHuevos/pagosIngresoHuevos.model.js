import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const PagosIngresoHuevos = db.define('pagosIngresoHuevos', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  ingreso_huevo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  metodoPago_id: {
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

export { PagosIngresoHuevos };
