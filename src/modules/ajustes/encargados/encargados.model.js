import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const Encargados = db.define('encargados', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cargo: {
    type: DataTypes.ENUM('Vendedor', 'Comprador', 'Autorizado'),
    allowNull: false,
    defaultValue: 'Vendedor',
  },
});

export { Encargados };
