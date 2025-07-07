import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const DescansoMedico = db.define('descanso_medico', {
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
  titulo_descanso_medico: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_solicitud: {
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
  archivo_descanso_medico: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pendiente_autorizacion: {
    type: DataTypes.ENUM('PENDIENTE', 'ACEPTADO', 'RECHAZADO'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
  },
});

export { DescansoMedico };
