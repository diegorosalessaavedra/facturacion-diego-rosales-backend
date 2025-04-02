import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Clientes } from './clientes.model.js';

export const validExistCliente = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const cliente = await Clientes.findOne({
    where: {
      id,
    },
  });

  if (!cliente) {
    return next(new AppError(`itineario with id: ${id} not found `, 404));
  }

  req.cliente = cliente;
  next();
});
