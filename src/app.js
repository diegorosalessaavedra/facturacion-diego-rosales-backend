import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';

import { AppError } from './utils/AppError.js';

import { globalErrorHandler } from './utils/errors.js';

import { departamentosRouter } from './modules/ubigeos/departamentos/departamentos.routes.js';
import { provinciasRouter } from './modules/ubigeos/provincias/provincias.routes.js';
import { distritosRouter } from './modules/ubigeos/distritos/distritos.routes.js';
import { apiPeruRouter } from './modules/apiPeru/apiPeru.routes.js';
import { metodosGastosRouter } from './modules/ajustes/metodosGastos/metodosGastos.routes.js';
import { metodosPagoRouter } from './modules/ajustes/metodosPagos/metodosPago.routes.js';
import { misProductosRouter } from './modules/productos/misProductos/misProductos.routes.js';
import { cotizacionesRouter } from './modules/ventas/cotizaciones/cotizaciones.routes.js';
import { usersRouter } from './modules/user/user.routes.js';
import { clientesRouter } from './modules/clientesProveedores/clientes/clientes.routes.js';
import { proveedoresRouter } from './modules/clientesProveedores/proveedores/proveedores.routes.js';
import { ordenesCompraRouter } from './modules/compras/ordenesCompra/ordenesCompra.routes.js';
import { productosOrdenComprasRouter } from './modules/compras/productosOrdenCompras/productosOrdenCompras.routes.js';
import { comprobantesOrdenComprasRouter } from './modules/compras/comprobantesOrdenCompras/comprobantesOrdenCompras.routes.js';
import { encargadoPagoRouter } from './modules/ajustes/encargados/encargados.routes.js';
import { comprobantesElectroincosRouter } from './modules/comprobantes/filesComprobanteElectronicos/comprobantesElectronicos/comprobantesElectronicos.routes.js';
import { notasComprobantesRouter } from './modules/comprobantes/filesNotasComprobante/notasComprobante/notasComprobante.routes.js';
import { huevosRouter } from './modules/productos/huevos/huevos.routes.js';
import { ingresoHuevosRouter } from './modules/compras/ingresoHuevos/ingresoHuevos.routes.js';
import { ventasHuevosRouter } from './modules/ventas/ventasHuevos/ventasHuevos.routes.js';
import { cuentasBancariasRouter } from './modules/ajustes/cuentasBancarias/cuentasBancarias.routes.js';
import { costosProduccionRouter } from './modules/costos/costosProduccion/costosProduccion.routes.js';
import { origenRouter } from './modules/clientesProveedores/origen/origen.routes.js';
import { colaboradoresRouter } from './modules/rrhh/modColaboradores/colaboradores/colaboradores.routes.js';
import { cargoLaboralRouter } from './modules/rrhh/modColaboradores/cargoLaboral/cargoLaboral.routes.js';
import { docComplemColaboradoresRouter } from './modules/rrhh/modColaboradores/docCompleColaboradores/docCompleColaboradores.routes.js';
import { descanzoMedicoRouter } from './modules/rrhh/modDescanzoMedico/descanzoMedico/descanzoMedico.routes.js';
import { vacacionesRouter } from './modules/rrhh/modVacaciones/vacaciones/vacaciones.routes.js';
import { vacaionesSolicitadasRouter } from './modules/rrhh/modVacaciones/vacionesSolicitadas/vacionesSolicitadas.routes.js';
import { contratosRouter } from './modules/rrhh/modColaboradores/contratos/contratos.routes.js';
import { memosRouter } from './modules/rrhh/modColaboradores/memos/memos.routes.js';

const app = express();

app.set('trust proxy', 1);
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in one hour.',
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cors());
app.use(xss());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(hpp());
app.use('/api/v1', limiter);
app.use('/api/v1/users', usersRouter);

app.use('/api/v1/clientes', clientesRouter);
app.use('/api/v1/proveedores', proveedoresRouter);
app.use('/api/v1/origen', origenRouter);

// ubigeo
app.use('/api/v1/departamentos', departamentosRouter);
app.use('/api/v1/provincias', provinciasRouter);
app.use('/api/v1/distritos', distritosRouter);

app.use('/api/v1/apiPeru', apiPeruRouter);

//ajustes
app.use('/api/v1/ajustes/metodos-gasto', metodosGastosRouter);
app.use('/api/v1/ajustes/metodos-pago', metodosPagoRouter);
app.use('/api/v1/ajustes/encargado', encargadoPagoRouter);
app.use('/api/v1/ajustes/cuentas-banco', cuentasBancariasRouter);

//ajustes

// productos
app.use('/api/v1/productos/mis-productos', misProductosRouter);
app.use('/api/v1/productos/huevos', huevosRouter);

// productos

//ventas
app.use('/api/v1/ventas/cotizaciones', cotizacionesRouter);
app.use('/api/v1/ventas/huevos', ventasHuevosRouter);

//ventas

//compras
app.use('/api/v1/compras/orden-compra', ordenesCompraRouter);
app.use('/api/v1/compras/productos-orden-compra', productosOrdenComprasRouter);
app.use(
  '/api/v1/compras/comprobante/orden-compra',
  comprobantesOrdenComprasRouter
);
app.use('/api/v1/compras/ingreso-huevos', ingresoHuevosRouter);

//compras

//comprobantes
app.use(
  '/api/v1/comprobantes/comprobante-electronico',
  comprobantesElectroincosRouter
);
app.use('/api/v1/comprobantes/notas-comprobantes', notasComprobantesRouter);
//comprobantes

//costos
app.use('/api/v1/costos/costos-produccion', costosProduccionRouter);
//costos

// RRHH
//colaboradores
app.use('/api/v1/rrhh/colaboradores', colaboradoresRouter);
app.use('/api/v1/rrhh/cargo-laboral', cargoLaboralRouter);
app.use(
  '/api/v1/rrhh/doc-complementarios-colaborador',
  docComplemColaboradoresRouter
);
app.use('/api/v1/rrhh/contratos', contratosRouter);
app.use('/api/v1/rrhh/memos', memosRouter);

// descanzo medico
app.use('/api/v1/rrhh/descanzo-medico', descanzoMedicoRouter);

//vacaciones
app.use('/api/v1/rrhh/vacaciones', vacacionesRouter);
app.use('/api/v1/rrhh/vacaciones-solicitadas', vacaionesSolicitadasRouter);

// RRHH

app.all('*', (req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server! 💀`, 404)
  );
});

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    next(err);
  }
});

app.use(globalErrorHandler);

export { app };
