import express from 'express';

import * as descansoMedicoController from './descansoMedico.controller.js';
import * as descansoMedicoMiddleware from './descansoMedico.middleware.js';
import * as colaboradoresMiddleware from '../../modColaboradores/colaboradores/colaboradores.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';
import { upload } from '../../../../utils/multer.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', descansoMedicoController.findAll);

router.get('/colaboradores', descansoMedicoController.findAllColaboradores);
router.get('/colaborador/:id', descansoMedicoController.findAllColaborador);
router.patch(
  '/:id',
  descansoMedicoMiddleware.validExistDescansoMedico,
  descansoMedicoController.updateAutorizacion
);

router
  .route('/:id')
  .post(
    upload.single('file'),
    colaboradoresMiddleware.validExistColaborador,
    descansoMedicoController.create
  )
  .get(
    descansoMedicoMiddleware.validExistDescansoMedico,
    descansoMedicoController.create
  )
  .delete(
    descansoMedicoMiddleware.validExistDescansoMedico,
    descansoMedicoController.deleteElement
  );

const descansoMedicoRouter = router;

export { descansoMedicoRouter };
