import express from 'express';

import * as vacacionesController from './vacaciones.controller.js';
import * as vacacionesMiddleware from './vacaciones.middleware.js';
import * as colaboradoresMiddleware from '../../modColaboradores/colaboradores/colaboradores.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/colaboradores', vacacionesController.findCollaboradores);

router.get('/', vacacionesController.findAll);

router
  .route('/:id')
  .get(vacacionesMiddleware.validExistVacaciones, vacacionesController.create)
  .post(
    colaboradoresMiddleware.validExistColaborador,
    vacacionesController.create
  )
  .patch(vacacionesMiddleware.validExistVacaciones, vacacionesController.update)
  .delete(
    vacacionesMiddleware.validExistVacaciones,
    vacacionesController.deleteElement
  );

const vacacionesRouter = router;

export { vacacionesRouter };
