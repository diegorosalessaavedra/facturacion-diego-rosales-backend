import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MisProductos } from './misProductos.model.js';

export const validExistMisProductos = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const miProducto = await MisProductos.findOne({
    where: {
      id,
    },
  });

  if (!miProducto) {
    return next(new AppError(`the miProducto  with id: ${id} not found `, 404));
  }

  req.miProducto = miProducto;
  next();
});
