import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const Distritos = db.define('distritos', {
  id: {
    primaryKey: true,
    allowNull: false,
    unique: true,
    type: DataTypes.INTEGER,
  },
  distrito: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  provinciaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export { Distritos };
