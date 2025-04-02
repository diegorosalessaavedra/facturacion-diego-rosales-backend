import express from 'express';

import * as provinciasController from './provincias.controller.js';

const router = express.Router();

router.get('/:id', provinciasController.findAll);

const provinciasRouter = router;

export { provinciasRouter };
