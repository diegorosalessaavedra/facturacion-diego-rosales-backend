import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config';

const Vacaciones = db.define('vacaciones', {
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
  periodo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dias_disponibles: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export { Vacaciones };
