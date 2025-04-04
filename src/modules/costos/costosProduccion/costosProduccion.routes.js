import express from 'express';

import * as costosProduccionController from './costosProduccion.controller.js';
import * as costosProduccionMiddleware from './costosProduccion.middleware.js';
import * as ingresoHuevosMiddleware from '../../compras/ingresoHuevos/ingresoHuevos.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', costosProduccionController.findAll);

router
  .route('/:id')
  .post(
    ingresoHuevosMiddleware.validExistIngresoHuevos,
    costosProduccionController.create
  )
  .get(
    costosProduccionMiddleware.validCostosProduccion,
    costosProduccionController.findOne
  )
  .patch(
    costosProduccionMiddleware.validCostosProduccion,
    costosProduccionController.update
  )
  .delete(
    costosProduccionMiddleware.validCostosProduccion,
    costosProduccionController.deleteElement
  );

const costosProduccionRouter = router;

export { costosProduccionRouter };
