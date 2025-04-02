import express from 'express';

import * as ingresoHuevosController from './ingresoHuevos.controller.js';
import * as ingresoHuevosMiddleware from './ingresoHuevos.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', ingresoHuevosController.findAll);
router.post('/', ingresoHuevosController.create);

router
  .route('/:id')
  .get(
    ingresoHuevosMiddleware.validExistIngresoHuevos,
    ingresoHuevosController.findOne
  )
  .patch(
    ingresoHuevosMiddleware.validExistIngresoHuevos,
    ingresoHuevosController.update
  )
  .delete(
    ingresoHuevosMiddleware.validExistIngresoHuevos,
    ingresoHuevosController.deleteElement
  );

const ingresoHuevosRouter = router;

export { ingresoHuevosRouter };
