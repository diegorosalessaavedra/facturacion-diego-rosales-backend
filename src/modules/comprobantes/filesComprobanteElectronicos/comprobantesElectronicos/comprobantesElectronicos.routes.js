import express from 'express';

import * as comprobantesElectronicosController from './comprobantesElectronicos.controller.js';
import * as comprobantesElectronicosMiddleware from './comprobantesElectronicos.middleware.js';
import * as cotizacionesMiddleware from '../../../ventas/cotizaciones/cotizaciones.middleware.js';
import * as authMiddleware from '../../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);
router.get('/total', comprobantesElectronicosController.findAllTotal);

router.get('/', comprobantesElectronicosController.findAll);
router.get(
  '/cotizaciones',
  comprobantesElectronicosController.findAllCotizaciones
);

router.post('/', comprobantesElectronicosController.create);

router.get(
  '/anular/:id',
  comprobantesElectronicosMiddleware.validExistComprobantesElectronicosIncluide,
  comprobantesElectronicosController.anularComprobante
);

router
  .route('/:id')
  .post(
    cotizacionesMiddleware.validExistCotizaciones,
    comprobantesElectronicosController.createCotizacion
  )
  .get(
    comprobantesElectronicosMiddleware.validExistComprobantesElectronicosIncluide,
    comprobantesElectronicosController.findOne
  )
  .patch(
    comprobantesElectronicosMiddleware.validExistComprobantesElectronicos,
    comprobantesElectronicosController.update
  )
  .delete(
    comprobantesElectronicosMiddleware.validExistComprobantesElectronicos,
    comprobantesElectronicosController.deleteElement
  );

const comprobantesElectroincosRouter = router;

export { comprobantesElectroincosRouter };
