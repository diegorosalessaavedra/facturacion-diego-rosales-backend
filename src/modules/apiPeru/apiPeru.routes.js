import express from 'express';

import * as apiPeruController from './apiPeru.controller.js';

const router = express.Router();

router.get('/dni', apiPeruController.findDni);
router.get('/ruc', apiPeruController.findRuc);
router.get('/dolar', apiPeruController.findDolar);

const apiPeruRouter = router;

export { apiPeruRouter };
