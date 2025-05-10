import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const Origen = db.define('origen', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },

  nombre_origen: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  codigo_origen: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export { Origen };
