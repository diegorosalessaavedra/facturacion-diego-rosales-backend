import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config';

const DocCompleDM = db.define('doc_comple_dm', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  descanzo_medico_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link_doc_complementario: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export { DocCompleDM };
