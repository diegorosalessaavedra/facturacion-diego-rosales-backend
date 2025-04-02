import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const PagosComprobanteOrdenCompras = db.define('pagosComprobanteOrdenCompras', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  comprobanteOrdenCompraId: {
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

export { PagosComprobanteOrdenCompras };
