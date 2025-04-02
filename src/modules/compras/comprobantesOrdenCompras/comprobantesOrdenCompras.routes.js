import express from 'express';

import * as comprobantesOrdenComprasController from './comprobantesOrdenCompras.controller.js';
import * as comprobantesOrdenComprasMiddleware from './comprobantesOrdenCompras.middleware.js';
import * as ordenesCompraMiddleware from '../ordenesCompra/ordenesCompra.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', comprobantesOrdenComprasController.findAll);
router.get('/total', comprobantesOrdenComprasController.findAllTotal);

router.post(
  '/:id',
  ordenesCompraMiddleware.validExistOrdenesCompra,
  comprobantesOrdenComprasController.create
);

router
  .route('/:id')
  .get(
    comprobantesOrdenComprasMiddleware.validExistComprobantesOrdenComprasIncluide,
    comprobantesOrdenComprasController.findOne
  )
  .patch(
    comprobantesOrdenComprasMiddleware.validExistComprobantesOrdenCompras,
    comprobantesOrdenComprasController.update
  )
  .delete(
    comprobantesOrdenComprasMiddleware.validExistComprobantesOrdenCompras,
    comprobantesOrdenComprasController.deleteElement
  );

const comprobantesOrdenComprasRouter = router;

export { comprobantesOrdenComprasRouter };
