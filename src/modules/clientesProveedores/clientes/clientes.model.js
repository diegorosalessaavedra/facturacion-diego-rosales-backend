import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const Clientes = db.define('clientes', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  tipoDocIdentidad: {
    type: DataTypes.ENUM(
      'Doc.trib.no.dom.sin.ruc',
      'DNI',
      'CE',
      'RUC',
      'Pasaporte'
    ),
    allowNull: false,
  },
  numeroDoc: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nombreApellidos: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nombreComercial: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  departamentoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  provinciaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  distritoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export { Clientes };
