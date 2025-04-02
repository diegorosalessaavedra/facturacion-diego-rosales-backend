import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const ProductosComprobanteElectronico = db.define(
  'productosComprobanteElectronico',
  {
    id: {
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    comprobanteElectronicoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },

    precioUnitario: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
    },
  }
);

export { ProductosComprobanteElectronico };
