import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config';

const Colaboradores = db.define('colaboradores', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellidos_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dni_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  telefono_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  correo_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  direccion_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numero_casa_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ciudad_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  provincia_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  departamento_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  direccion_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  direccion_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
