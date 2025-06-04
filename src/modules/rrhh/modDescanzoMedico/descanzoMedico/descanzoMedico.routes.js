import express from 'express';

import * as descanzoMedicoController from './descanzoMedico.controller.js';
import * as descanzoMedicoMiddleware from './descanzoMedico.middleware.js';
import * as colaboradoresMiddleware from '../../modColaboradores/colaboradores/colaboradores.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';
import { upload } from '../../../../utils/multer.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/colaboradores', descanzoMedicoController.findAllColaboradores);
router.get('/colaborador/:id', descanzoMedicoController.findAllColaborador);

router
  .route('/:id')
  .post(
    upload.single('file'),
    colaboradoresMiddleware.validExistColaborador,
    descanzoMedicoController.create
  )
  .get(
    descanzoMedicoMiddleware.validExistDescanzoMedico,
    descanzoMedicoController.create
  )
  .delete(
    descanzoMedicoMiddleware.validExistDescanzoMedico,
    descanzoMedicoController.deleteElement
  );

const descanzoMedicoRouter = router;

export { descanzoMedicoRouter };
