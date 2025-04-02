import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { CuentasBancarias } from './cuentasBancarias.model.js';

export const validExistCuentasBancarias = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const cuentaBancaria = await CuentasBancarias.findOne({
    where: {
      id,
    },
  });

  if (!cuentaBancaria) {
    return next(new AppError(`metodo Gasto  with id: ${id} not found `, 404));
  }

  req.cuentaBancaria = cuentaBancaria;
  next();
});
