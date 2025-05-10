import express from 'express';

import * as origenController from './origen.controller.js';
import * as origenMiddleware from './origen.middleware.js';

const router = express.Router();

router.get('/', origenController.findAll);
router.post('/', origenController.create);

router
  .route('/:id')
  .get(origenMiddleware.validExistOrigen, origenController.findOne)
  .patch(origenMiddleware.validExistOrigen, origenController.update)
  .delete(origenMiddleware.validExistOrigen, origenController.deleteElement);

const origenRouter = router;

export { origenRouter };
