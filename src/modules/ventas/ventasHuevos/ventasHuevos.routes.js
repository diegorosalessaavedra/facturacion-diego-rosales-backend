import express from 'express';

import * as ventasHuevosController from './ventasHuevos.controller.js';
import * as ventasHuevosMiddleware from './ventasHuevos.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);
router.get('/', ventasHuevosController.findAll);

router.post('/', ventasHuevosController.create);

router
  .route('/:id')
  .patch(
    ventasHuevosMiddleware.validExistVentaHuevo,
    ventasHuevosController.update
  )
  .get(
    ventasHuevosMiddleware.validExistVentaHuevo,
    ventasHuevosController.findOne
  )
  .delete(
    ventasHuevosMiddleware.validExistVentaHuevo,
    ventasHuevosController.deleteElement
  );

const ventasHuevosRouter = router;

export { ventasHuevosRouter };
