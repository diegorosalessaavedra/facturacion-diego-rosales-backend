import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const CargoLaboral = db.define('cargo_laborales', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export { CargoLaboral };
