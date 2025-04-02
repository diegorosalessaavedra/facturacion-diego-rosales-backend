import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const Departamentos = db.define('departamentos', {
  id: {
    primaryKey: true,
    allowNull: false,
    unique: true,
    type: DataTypes.INTEGER,
  },
  departamento: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export { Departamentos };
