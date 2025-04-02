import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const NotasComprobante = db.define('notas_comprobantes', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  cliente_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  comprobante_electronico_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  numero_serie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  serie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha_emision: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo_comprobante: {
    type: DataTypes.ENUM('FACTURA ELECTRÓNICA', 'BOLETA DE VENTA'),
    allowNull: false,
  },
  tipo_nota: {
    type: DataTypes.ENUM('NOTA DE CREDITO', 'NOTA DE DEBITO'),
    allowNull: false,
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codigo_motivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  total_valor_venta: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  total_igv: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  total_venta: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  legend: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('ACEPTADA', 'RECHAZADA', 'PENDIENTE'),
    allowNull: false,
    defaultValue: 'ACEPTADA',
  },
  urlXml: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cdr: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  digestValue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qrContent: { type: DataTypes.TEXT, allowNull: true },
});

export { NotasComprobante };
