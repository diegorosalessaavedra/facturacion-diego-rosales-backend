import express from 'express';

import * as clientesController from './clientes.controller.js';
import * as clientesMiddleware from './clientes.middleware.js';

const router = express.Router();

router.get('/', clientesController.findAll);
router.post('/', clientesController.create);
router.get('/grafico-compras', clientesController.findAllGraficoCompras);
router.get(
  '/registrados-por-mes',
  clientesController.getClientesRegistradosPorMes
);

router
  .route('/:id')
  .get(clientesMiddleware.validExistCliente, clientesController.findOne)
  .patch(clientesMiddleware.validExistCliente, clientesController.update)
  .delete(
    clientesMiddleware.validExistCliente,
    clientesController.deleteElement
  );

const clientesRouter = router;

export { clientesRouter };
