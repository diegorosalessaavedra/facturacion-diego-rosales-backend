import express from 'express';

import * as ordenesCompraController from './ordenesCompra.controller.js';
import * as ordenesCompraMiddleware from './ordenesCompra.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', ordenesCompraController.findAll);
router.post('/', ordenesCompraController.create);

router
  .route('/:id')
  .get(
    ordenesCompraMiddleware.validExistOrdenesCompraIncluide,
    ordenesCompraController.findOne
  )
  .patch(
    ordenesCompraMiddleware.validExistOrdenesCompra,
    ordenesCompraController.update
  )
  .delete(
    ordenesCompraMiddleware.validExistOrdenesCompra,
    ordenesCompraController.deleteElement
  );

const ordenesCompraRouter = router;

export { ordenesCompraRouter };
