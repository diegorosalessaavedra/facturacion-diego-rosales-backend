import express from 'express';

import * as misProductosController from './misProductos.controller.js';
import * as misProductosMiddleware from './misProductos.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

// router.use(authMiddleware.protect);

router.get('/', misProductosController.findAll);
router.get('/kardex', misProductosController.findAllKardex);

router.post('/', misProductosController.create);

router
  .route('/:id')
  .get(
    misProductosMiddleware.validExistMisProductos,
    misProductosController.findOne
  )
  .patch(
    misProductosMiddleware.validExistMisProductos,
    misProductosController.update
  )
  .delete(
    misProductosMiddleware.validExistMisProductos,
    misProductosController.deleteElement
  );

const misProductosRouter = router;

export { misProductosRouter };
