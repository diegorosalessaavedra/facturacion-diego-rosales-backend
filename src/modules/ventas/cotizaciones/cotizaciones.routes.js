import express from 'express';

import * as cotizacionesController from './cotizaciones.controller.js';
import * as cotizacionesMiddleware from './cotizaciones.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);
router.get('/total', cotizacionesController.findAllTotal);
router.get('/', cotizacionesController.findAll);

router.post('/', cotizacionesController.create);

router
  .route('/:id')
  .get(
    cotizacionesMiddleware.CotizacionIncludes,
    cotizacionesController.findOne
  )
  .patch(
    cotizacionesMiddleware.validExistCotizaciones,
    cotizacionesController.update
  )
  .delete(
    cotizacionesMiddleware.validExistCotizaciones,
    cotizacionesController.deleteElement
  );

const cotizacionesRouter = router;

export { cotizacionesRouter };
