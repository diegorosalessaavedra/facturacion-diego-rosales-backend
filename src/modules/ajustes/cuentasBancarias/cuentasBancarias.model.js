import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const CuentasBancarias = db.define('cuentasBancarias', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  banco: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  cci: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  moneda: {
    type: DataTypes.ENUM('Soles', 'Dólares Americanos'),
    allowNull: false,
    defaultValue: 'Soles',
  },
});

export { CuentasBancarias };
