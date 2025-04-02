import express from 'express';

import * as cuentasBancariasController from './cuentasBancarias.controller.js';
import * as cuentasBancariasMiddleware from './cuentasBancarias.middleware.js';
import * as authMiddleware from '../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', cuentasBancariasController.findAll);

router.post('/', cuentasBancariasController.create);
router
  .route('/:id')
  .get(
    cuentasBancariasMiddleware.validExistCuentasBancarias,
    cuentasBancariasController.findOne
  )
  .patch(
    cuentasBancariasMiddleware.validExistCuentasBancarias,
    cuentasBancariasController.update
  )
  .delete(
    cuentasBancariasMiddleware.validExistCuentasBancarias,
    cuentasBancariasController.deleteElement
  );

const cuentasBancariasRouter = router;

export { cuentasBancariasRouter };
