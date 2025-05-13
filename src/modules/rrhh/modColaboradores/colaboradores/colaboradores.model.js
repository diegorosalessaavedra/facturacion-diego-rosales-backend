import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

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

  nombre_familiar_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  apellidos_familiar_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telefono_familiar_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },

  direccion_colaborador: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // numero_casa_colaborador: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
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
  // codigo_postal_colaborador: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  cargo_laboral_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tipo_empleo_colaborador: {
    type: DataTypes.ENUM(
      'Jornada completa',
      'Jornada parcial',
      'Autónomo',
      'Profesional independiente',
      'Contrato temporal',
      'Contrato de prácticas',
      'Temporal'
    ),
    allowNull: false,
    defaultValue: 'Jornada completa',
  },
  educacion_colaborador: {
    type: DataTypes.ENUM(
      'Sin estudios',
      'Primaria completa',
      'Secundaria completa',
      'Estudios técnicos',
      'Estudios universitarios (en curso)',
      'Bachiller universitario',
      'Titulado universitario',
      'Estudios de posgrado (Maestría)',
      'Estudios de posgrado (Doctorado)',
      'Autodidacta / Formación independiente'
    ),
    allowNull: false,
    defaultValue: 'Secundaria completa',
  },
  nombre_institucion_educativa: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  especializacion_titulo_colaborador: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cv_colaborador: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export { Colaboradores };
