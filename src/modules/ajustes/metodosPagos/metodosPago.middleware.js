import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosPago } from './metodosPago.model.js';

export const validExistMetodosPago = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const metodoPago = await MetodosPago.findOne({
    where: {
      id,
    },
  });

  if (!metodoPago) {
    return next(new AppError(`metodo Gasto  with id: ${id} not found `, 404));
  }

  req.metodoPago = metodoPago;
  next();
});
