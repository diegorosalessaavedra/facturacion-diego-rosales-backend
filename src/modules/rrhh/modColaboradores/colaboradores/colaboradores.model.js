import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const Colaboradores = db.define('colaboradores', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  foto_colaborador: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  nombre_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellidos_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_nacimiento_colaborador: {
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
    allowNull: false,
    unique: true,
  },
  correo_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  direccion_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  departamento_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  provincia_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  distrito_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // contacto de emergencia
  nombre_contacto_emergencia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellidos_contacto_emergencia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono_contacto_emergencia: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  vinculo_contacto_emergencia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // cargo laboral
  cargo_laboral_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  cv_colaborador: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  estado: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
    defaultValue: 'ACTIVO',
    allowNull: false,
  },
});

export { Colaboradores };
