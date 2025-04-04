import { DataTypes } from 'sequelize';
import { db } from '../../../db/db.config.js';

const CostosProduccion = db.define('costosProduccion', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  ingreso_huevo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  fecha_inicio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_fin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mes: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semana: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  alimento: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  gas: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  planillas: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  agua: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  rancho: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  flete: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  otros_gastos: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  costo_produccion: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  kg_producidos: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  paquetes: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  peso_paquete: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  costo_kilo: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  precio_kilo: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  profit_kilo: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  profit_total: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export { CostosProduccion };
