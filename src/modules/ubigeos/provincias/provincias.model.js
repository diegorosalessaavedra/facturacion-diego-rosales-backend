import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const Provincias = db.define('provincias', {
  id: {
    primaryKey: true,
    allowNull: false,
    unique: true,
    type: DataTypes.INTEGER,
  },
  provincia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  departamentoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export { Provincias };
