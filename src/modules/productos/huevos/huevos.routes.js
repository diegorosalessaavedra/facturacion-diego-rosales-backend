import express from 'express';

import * as huevosController from './huevos.controller.js';
import * as huevosMiddleware from './huevos.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', huevosController.findAll);

router.post('/', huevosController.create);

router
  .route('/:id')
  .get(huevosMiddleware.validExistHuevos, huevosController.findOne)
  .patch(huevosMiddleware.validExistHuevos, huevosController.update)
  .delete(huevosMiddleware.validExistHuevos, huevosController.deleteElement);

const huevosRouter = router;

export { huevosRouter };
