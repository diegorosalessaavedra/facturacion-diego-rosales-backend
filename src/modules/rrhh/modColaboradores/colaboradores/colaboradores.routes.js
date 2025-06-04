import express from 'express';

import * as colaboradoresController from './colaboradores.controller.js';
import * as colaboradoresMiddleware from './colaboradores.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';
import { upload } from '../../../../utils/multer.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', colaboradoresController.findAll);
router.post(
  '/',
  upload.fields([
    { name: 'foto_colaborador', maxCount: 1 },
    { name: 'cv_colaborador', maxCount: 1 },
    { name: 'archivos_complementarios', maxCount: 10 }, // Ajusta maxCount según necesites
  ]),
  colaboradoresController.create
);

router
  .route('/:id')
  .get(
    colaboradoresMiddleware.validExistColaborador,
    colaboradoresController.create
  );

const colaboradoresRouter = router;

export { colaboradoresRouter };
