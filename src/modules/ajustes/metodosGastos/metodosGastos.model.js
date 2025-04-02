import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const MetodosGasto = db.define('metodosGasto', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export { MetodosGasto };
