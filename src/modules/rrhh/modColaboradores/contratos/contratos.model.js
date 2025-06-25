import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const Contratos = db.define('contratos', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  colaborador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo_contrato: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_inicio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_final: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  documento_contrato: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado_contrato: {
    type: DataTypes.ENUM('vigente', 'expirado'),
    allowNull: false,
    defaultValue: 'vigente',
  },
});

export { Contratos };
