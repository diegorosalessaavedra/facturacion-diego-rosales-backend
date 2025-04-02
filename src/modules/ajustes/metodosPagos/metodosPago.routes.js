import express from 'express';

import * as metodosPagoController from './metodosPago.controller.js';
import * as metodosPagoMiddleware from './metodosPago.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

// router.use(authMiddleware.protect);

router.get('/', metodosPagoController.findAll);
router.post('/', metodosPagoController.create);

router
  .route('/:id')
  .get(
    metodosPagoMiddleware.validExistMetodosPago,
    metodosPagoController.findOne
  )
  .patch(
    metodosPagoMiddleware.validExistMetodosPago,
    metodosPagoController.update
  )
  .delete(
    metodosPagoMiddleware.validExistMetodosPago,
    metodosPagoController.deleteElement
  );

const metodosPagoRouter = router;

export { metodosPagoRouter };
