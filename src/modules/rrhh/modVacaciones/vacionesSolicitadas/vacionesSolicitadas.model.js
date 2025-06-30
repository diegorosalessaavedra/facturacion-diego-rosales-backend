import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const VacionesSolicitadas = db.define('vacaciones_solicitadas', {
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
  fecha_solicitud: {
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
  dias_totales: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  solicitud_adjunto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  autorizacion_modificado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  pendiente_autorizacion: {
    type: DataTypes.ENUM('PENDIENTE', 'ACEPTADO', 'RECHAZADO', 'ANULADO'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
  },
});

export { VacionesSolicitadas };
