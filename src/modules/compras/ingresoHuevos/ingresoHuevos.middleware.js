import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosPago } from '../../ajustes/metodosPagos/metodosPago.model.js';
import { Origen } from '../../clientesProveedores/origen/origen.model.js';
import { Huevos } from '../../productos/huevos/huevos.model.js';
import { PagosIngresoHuevos } from '../pagosIngresoHuevos/pagosIngresoHuevos.model.js';
import { IngresoHuevos } from './ingresoHuevos.model.js';

export const validExistIngresoHuevos = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const ingresoHuevo = await IngresoHuevos.findOne({
    where: {
      id,
    },
    include: [
      { model: Huevos, as: 'huevos' },
      {
        model: PagosIngresoHuevos,
        as: 'pagos',
        include: [{ model: MetodosPago }],
      },
      { model: Origen, as: 'origen' },
    ],
  });

  if (!ingresoHuevo) {
    return next(
      new AppError(`the ingresoHuevo  with id: ${id} not found `, 404)
    );
  }

  req.ingresoHuevo = ingresoHuevo;
  next();
});
