import express from 'express';

import * as distritosController from './distritos.controller.js';

const router = express.Router();

router.get('/:id', distritosController.findAll);

const distritosRouter = router;

export { distritosRouter };
