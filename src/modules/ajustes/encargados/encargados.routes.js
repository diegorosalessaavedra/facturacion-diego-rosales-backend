import express from 'express';

import * as encargadosController from './encargados.controller.js';
import * as encargadosMiddleware from './encargados.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', encargadosController.findAll);
router.post('/', encargadosController.create);

router
  .route('/:id')
  .get(encargadosMiddleware.validExistEncargados, encargadosController.findOne)
  .patch(encargadosMiddleware.validExistEncargados, encargadosController.update)
  .delete(
    encargadosMiddleware.validExistEncargados,
    encargadosController.deleteElement
  );

const encargadoPagoRouter = router;

export { encargadoPagoRouter };
