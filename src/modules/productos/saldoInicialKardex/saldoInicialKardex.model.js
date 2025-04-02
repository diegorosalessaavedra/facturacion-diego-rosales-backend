import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const SaldoInicialKardex = db.define('saldoInicialKardex', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  miProductoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.DECIMAL(20, 5),
    allowNull: false,
  },
  precioTotal: {
    type: DataTypes.DECIMAL(20, 5),
    defaultValue: 0,
    allowNull: false,
  },
});

export { SaldoInicialKardex };
