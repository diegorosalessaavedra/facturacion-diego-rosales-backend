import express from 'express';

import * as colaboradoresController from './colaboradores.controller.js';
import * as colaboradoresMiddleware from './colaboradores.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', colaboradoresController.findAll);

router
  .route('/:id')
  .get(
    colaboradoresMiddleware.validExistColaborador,
    colaboradoresController.create
  )
  .post(colaboradoresController.create);

const colaboradoresRouter = router;

export { colaboradoresRouter };
