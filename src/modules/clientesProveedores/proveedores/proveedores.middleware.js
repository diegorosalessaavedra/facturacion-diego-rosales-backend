import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Proveedores } from './proveedores.model.js';

export const validExistProveedores = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const proveedor = await Proveedores.findOne({
    where: {
      id,
    },
  });

  if (!proveedor) {
    return next(new AppError(`itineario with id: ${id} not found `, 404));
  }

  req.proveedor = proveedor;
  next();
});
