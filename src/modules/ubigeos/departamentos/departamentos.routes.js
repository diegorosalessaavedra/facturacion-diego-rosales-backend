import express from 'express';

import * as departamentosController from './departamentos.controller.js';

const router = express.Router();

router.get('/', departamentosController.findAll);

const departamentosRouter = router;

export { departamentosRouter };
