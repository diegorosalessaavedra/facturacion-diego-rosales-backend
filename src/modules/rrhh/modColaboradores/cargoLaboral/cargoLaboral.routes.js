import express from 'express';

import * as cargoLaboralController from './cargoLaboral.controller.js';
import * as cargoLaboralMiddleware from './cargoLaboral.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', cargoLaboralController.findAll);
router.post('/', cargoLaboralController.create);

router
  .route('/:id')
  .get(
    cargoLaboralMiddleware.validExistCargoLaboral,
    cargoLaboralController.create
  )
  .patch(
    cargoLaboralMiddleware.validExistCargoLaboral,
    cargoLaboralController.update
  )
  .delete(
    cargoLaboralMiddleware.validExistCargoLaboral,
    cargoLaboralController.deleteElement
  );

const cargoLaboralRouter = router;

export { cargoLaboralRouter };
