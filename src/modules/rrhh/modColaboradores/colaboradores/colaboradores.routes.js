import express from 'express';

import * as colaboradoresController from './colaboradores.controller.js';
import * as colaboradoresMiddleware from './colaboradores.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';
import { upload } from '../../../../utils/multer.js';

const router = express.Router();

router.use(authMiddleware.protect);

// Obtener todos los colaboradores
router.get('/', colaboradoresController.findAll);
router.get('/inactivos', colaboradoresController.findAllInactivos);
router.get(
  '/activar/:id',
  colaboradoresMiddleware.validExistColaborador,
  colaboradoresController.activarColaborador
);

router.delete(
  '/desactivar/:id',
  colaboradoresMiddleware.validExistColaborador,
  colaboradoresController.desactivarColaborador
);

// Crear nuevo colaborador con archivos
router.post(
  '/',
  upload.fields([
    { name: 'foto_colaborador', maxCount: 1 },
    { name: 'cv_colaborador', maxCount: 1 },
    { name: 'archivos_complementarios', maxCount: 10 },
  ]),
  colaboradoresController.create
);

// Obtener uno y actualizar por ID
router
  .route('/:id')
  .get(
    colaboradoresMiddleware.validExistColaborador,
    colaboradoresController.findOne
  )
  .patch(
    upload.fields([
      { name: 'foto_colaborador', maxCount: 1 },
      { name: 'cv_colaborador', maxCount: 1 },
      { name: 'archivos_complementarios', maxCount: 10 },
    ]),
    colaboradoresMiddleware.validExistColaborador,
    colaboradoresController.update
  )
  .delete(
    colaboradoresMiddleware.validExistColaborador,
    colaboradoresController.deleteElement
  );

const colaboradoresRouter = router;

export { colaboradoresRouter };
