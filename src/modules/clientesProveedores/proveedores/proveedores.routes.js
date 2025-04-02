import express from 'express';

import * as proveedoresController from './proveedores.controller.js';
import * as proveedoresMiddleware from './proveedores.middleware.js';

const router = express.Router();

router.get('/', proveedoresController.findAll);
router.post('/', proveedoresController.create);

router
  .route('/:id')
  .get(
    proveedoresMiddleware.validExistProveedores,
    proveedoresController.findOne
  )
  .patch(
    proveedoresMiddleware.validExistProveedores,
    proveedoresController.update
  )
  .delete(
    proveedoresMiddleware.validExistProveedores,
    proveedoresController.deleteElement
  );

const proveedoresRouter = router;

export { proveedoresRouter };
