import express from 'express';

import * as notasComprobanteController from './notasComprobante.controller.js';
import * as notasComprobanteMiddleware from './notasComprobante.middleware.js';
import * as cotizacionesMiddleware from '../../../ventas/cotizaciones/cotizaciones.middleware.js';
import * as comprobantesElectronicosMiddleware from '../../filesComprobanteElectronicos/comprobantesElectronicos/comprobantesElectronicos.middleware.js';

const router = express.Router();

// router.use(authMiddleware.protect);

router.get('/', notasComprobanteController.findAll);

router
  .route('/:id')
  .post(
    comprobantesElectronicosMiddleware.validExistComprobantesElectronicos,
    notasComprobanteController.create
  )
  .get(
    notasComprobanteMiddleware.validExistNotasComprobante,
    notasComprobanteController.findOne
  )
  .patch(
    notasComprobanteMiddleware.validExistNotasComprobante,
    notasComprobanteController.update
  )
  .delete(
    notasComprobanteMiddleware.validExistNotasComprobante,
    notasComprobanteController.deleteElement
  );

const notasComprobantesRouter = router;

export { notasComprobantesRouter };
