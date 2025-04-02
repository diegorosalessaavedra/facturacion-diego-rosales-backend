import express from 'express';

import * as metodosGastosController from './metodosGastos.controller.js';
import * as metodosGastosMiddleware from './metodosGastos.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

// router.use(authMiddleware.protect);

router.get('/', metodosGastosController.findAll);
router.post('/', metodosGastosController.create);

router
  .route('/:id')
  .get(
    metodosGastosMiddleware.validExistMetodosGasto,
    metodosGastosController.findOne
  )
  .patch(
    metodosGastosMiddleware.validExistMetodosGasto,
    metodosGastosController.update
  )
  .delete(
    metodosGastosMiddleware.validExistMetodosGasto,
    metodosGastosController.deleteElement
  );

const metodosGastosRouter = router;

export { metodosGastosRouter };
