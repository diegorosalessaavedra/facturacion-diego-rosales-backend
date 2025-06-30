import express from 'express';

import * as vacaionesSolicitadasController from './vacionesSolicitadas.controller.js';
import * as vacaionesSolicitadasMiddleware from './vacionesSolicitadas.middleware.js';
import * as vacacionesMiddleware from '../vacaciones/vacaciones.middleware.js';

import * as authMiddleware from '../../../../auth/auth.middleware.js';
import { upload } from '../../../../utils/multer.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get(
  '/periodo/:id',
  vacacionesMiddleware.validExistVacaciones,
  vacaionesSolicitadasController.findAllPeriodo
);

router.get('/', vacaionesSolicitadasController.findAll);

router
  .route('/:id')
  .get(
    vacaionesSolicitadasMiddleware.validExistVacionesSolicitadas,
    vacaionesSolicitadasController.create
  )
  .post(
    upload.single('file'),
    vacacionesMiddleware.validExistVacaciones,
    vacaionesSolicitadasController.create
  )
  .patch(
    vacaionesSolicitadasMiddleware.validExistVacionesSolicitadas,
    vacaionesSolicitadasController.update
  )
  .delete(
    vacaionesSolicitadasMiddleware.validExistVacionesSolicitadas,
    vacaionesSolicitadasController.deleteElement
  );

const vacaionesSolicitadasRouter = router;

export { vacaionesSolicitadasRouter };
