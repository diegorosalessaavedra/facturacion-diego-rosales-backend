import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { IngresoHuevos } from '../../compras/ingresoHuevos/ingresoHuevos.model.js';
import { CostosProduccion } from './costosProduccion.model.js';

export const validCostosProduccion = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const costoProduccion = await CostosProduccion.findOne({
    where: {
      id,
    },
    include: [{ model: IngresoHuevos, as: 'ingreso_huevos' }],
  });

  if (!costoProduccion) {
    return next(
      new AppError(`the costoProduccion  with id: ${id} not found `, 404)
    );
  }

  req.costoProduccion = costoProduccion;
  next();
});
