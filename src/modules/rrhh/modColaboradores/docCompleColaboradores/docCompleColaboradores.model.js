import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const DocCompleColaboradores = db.define('doc_comple_colaboradores', {
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
  nombre_doc_complementario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link_doc_complementario: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export { DocCompleColaboradores };
