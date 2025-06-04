import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const DescanzoMedico = db.define('descanzo_medico', {
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
  titulo_descanzo_medico: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  periodo_inicio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  periodo_final: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  archivo_descanzo_medico: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export { DescanzoMedico };
