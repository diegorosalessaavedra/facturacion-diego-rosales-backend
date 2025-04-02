import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Encargados } from './encargados.model.js';

export const validExistEncargados = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const encargado = await Encargados.findOne({
    where: {
      id,
    },
  });

  if (!encargado) {
    return next(new AppError(`metodo Gasto  with id: ${id} not found `, 404));
  }

  req.encargado = encargado;
  next();
});
