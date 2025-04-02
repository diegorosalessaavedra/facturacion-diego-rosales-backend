import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { PagosOrdenCompras } from './pagosOrdenCompras.model.js';

export const validExistPagosOrdenCompras = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const pagoOrdenCompra = await PagosOrdenCompras.findOne({
      where: {
        id,
      },
    });

    if (!pagoOrdenCompra) {
      return next(
        new AppError(`the pagoOrdenCompra  with id: ${id} not found `, 404)
      );
    }

    req.pagoOrdenCompra = pagoOrdenCompra;
    next();
  }
);
