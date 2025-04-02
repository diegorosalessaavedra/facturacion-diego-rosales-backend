import { Sequelize } from 'sequelize';

const db = new Sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  logging: false,

  // Configuración de pool de conexiones
  pool: {
    max: 10, // Más conexiones simultáneas
    min: 2, // Mantener algunas conexiones siempre activas
    acquire: 30000, // Menor tiempo de espera
    idle: 20000, // Más tiempo antes de cerrar conexiones inactivas
  },

  // Opciones específicas del dialecto
  dialectOptions: {
    connectTimeout: 60000, // timeout de conexión (60 segundos)
    // Si estás usando PostgreSQL, estas opciones son útiles:
    statement_timeout: 60000, // timeout para statements
    idle_in_transaction_session_timeout: 60000,
  },

  // Reintentos de conexión
  retry: {
    max: 3, // número máximo de reintentos
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /TimeoutError/,
    ],
  },
});

export { db };
