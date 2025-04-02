import { DataTypes } from 'sequelize';
import { db } from '../../../../db/db.config.js';

const ComprobanteSujetaDetraccion = db.define('comprobanteSujetaDetraccion', {
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
  codBienDetraccion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codMedioPago: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ctaBancaria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  porcentaje: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
  montoDetraccion: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
  },
});

export { ComprobanteSujetaDetraccion };
