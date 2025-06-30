// Envío de errores en entorno de desarrollo
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    errorName: err.name,
    errorType: err.constructor.name,
  });
};

// Envío de errores en entorno de producción
const sendErrorProd = (err, res) => {
  // Error que el usuario puede entender
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Error inesperado
    console.error('💥 ERROR NO CONTROLADO:', err);
    res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error inesperado. Inténtalo más tarde.',
    });
  }
};

// Middleware de manejo global de errores
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const env = process.env.NODE_ENV || 'development';

  if (env === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

export { globalErrorHandler };
