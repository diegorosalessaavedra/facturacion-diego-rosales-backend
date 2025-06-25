import express from 'express';

import * as contratosController from './contratos.controller.js';
import * as contratosMiddleware from './contratos.middleware.js';
import * as colaboradoresMiddleware from '../colaboradores/colaboradores.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';
import { upload } from '../../../../utils/multer.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', contratosController.findAll);

router
  .route('/:id')
  .post(
    upload.single('file'),
    colaboradoresMiddleware.validExistColaborador,
    contratosController.create
  )
  .get(contratosMiddleware.validExistContrato, contratosController.findOne)
  .patch(contratosMiddleware.validExistContrato, contratosController.update)
  .delete(
    contratosMiddleware.validExistContrato,
    contratosController.deleteElement
  );

const contratosRouter = router;

export { contratosRouter };
