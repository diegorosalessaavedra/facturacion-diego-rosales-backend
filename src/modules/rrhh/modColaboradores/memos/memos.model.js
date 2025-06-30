import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const Memos = db.define('memos', {
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
  documento_memo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export { Memos };
