import express from 'express';

import * as productosOrdenComprasController from './productosComprobanteOrdenCompras.controller.js';
import * as productosOrdenComprasMiddleware from './productosComprobanteOrdenCompras.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';
import * as misProductosMiddleware from '../../productos/misProductos/misProductos.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', productosOrdenComprasController.findAll);
router.post('/', productosOrdenComprasController.create);
router.get(
  '/producto/:id',
  misProductosMiddleware.validExistMisProductos,
  productosOrdenComprasController.findAllIdProduct
);

router
  .route('/:id')
  .get(
    productosOrdenComprasMiddleware.validExistProductosOrdenCompras,
    productosOrdenComprasController.findOne
  )
  .patch(
    productosOrdenComprasMiddleware.validExistProductosOrdenCompras,
    productosOrdenComprasController.update
  )
  .delete(
    productosOrdenComprasMiddleware.validExistProductosOrdenCompras,
    productosOrdenComprasController.deleteElement
  );

const productosOrdenComprasRouter = router;

export { productosOrdenComprasRouter };
