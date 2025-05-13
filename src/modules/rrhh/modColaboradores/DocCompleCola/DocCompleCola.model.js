import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config';

const DocCompleCola = db.define('doc_comple_cola', {
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
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link_doc_complementario: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export { DocCompleCola };
