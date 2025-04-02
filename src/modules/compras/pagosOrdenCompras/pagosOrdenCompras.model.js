import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const PagosOrdenCompras = db.define('pagosOrdenCompras', {
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
  metodoPago: {
    type: DataTypes.JSON,
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

export { PagosOrdenCompras };
