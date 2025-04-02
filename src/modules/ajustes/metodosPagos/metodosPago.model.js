import { DataTypes, STRING } from 'sequelize';
import { db } from '../../../db/db.config.js';

const MetodosPago = db.define('metodosPago', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  metodo_pago: {
    type: DataTypes.ENUM('YAPE', 'PLIN', 'EFECTIVO', 'TRANSFERENCIA BANCARIA'),
    allowNull: false,
  },
  banco: {
    type: STRING,
    allowNull: true,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  condicionPago: {
    type: DataTypes.ENUM('Contado', 'Crédito'),
    allowNull: false,
    defaultValue: 'Contado',
  },
});

export { MetodosPago };
