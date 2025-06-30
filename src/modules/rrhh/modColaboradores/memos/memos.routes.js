import express from 'express';

import * as memosController from './memos.controller.js';
import * as memosMiddleware from './memos.middleware.js';
import * as colaboradoresMiddleware from '../colaboradores/colaboradores.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';
import { upload } from '../../../../utils/multer.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', memosController.findAll);

router
  .route('/:id')
  .post(
    upload.single('file'),
    colaboradoresMiddleware.validExistColaborador,
    memosController.create
  )
  .get(memosMiddleware.validExistMemo, memosController.findOne)
  .patch(memosMiddleware.validExistMemo, memosController.update)
  .delete(memosMiddleware.validExistMemo, memosController.deleteElement);

const memosRouter = router;

export { memosRouter };
