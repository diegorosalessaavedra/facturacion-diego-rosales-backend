import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config';

const SolicitarVacaciones = db.define('solicitar_vacaciones', {
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
  vacaciones_id: {
    type: DataTypes.INTEGER,
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
  dias_totales: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pendiente_autorización: {
    type: DataTypes.ENUM('PENDIENTE', 'ACEPTADO', 'RECHAZADO'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
  },
});

export { SolicitarVacaciones };
