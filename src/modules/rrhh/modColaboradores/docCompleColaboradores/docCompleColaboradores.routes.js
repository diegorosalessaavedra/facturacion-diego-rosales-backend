import express from 'express';

import * as docComplemColaboradoresController from './docCompleColaboradores.controller.js';
import * as docComplemColaboradoresMiddleware from './docCompleColaboradores.middleware.js';
import * as colaboradoresMiddleware from '../colaboradores/colaboradores.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';
import { upload } from '../../../../utils/multer.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', docComplemColaboradoresController.findAll);

router
  .route('/:id')
  .post(
    upload.single('doc_complementario'),
    colaboradoresMiddleware.validExistColaborador,
    docComplemColaboradoresController.create
  )
  .get(
    docComplemColaboradoresMiddleware.validExistDocCompleColaborador,
    docComplemColaboradoresController.findOne
  );

const docComplemColaboradoresRouter = router;

export { docComplemColaboradoresRouter };
