import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosGasto } from './metodosGastos.model.js';

export const validExistMetodosGasto = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const metodoGasto = await MetodosGasto.findOne({
    where: {
      id,
    },
  });

  if (!metodoGasto) {
    return next(new AppError(`metodo Gasto  with id: ${id} not found `, 404));
  }

  req.metodoGasto = metodoGasto;
  next();
});
