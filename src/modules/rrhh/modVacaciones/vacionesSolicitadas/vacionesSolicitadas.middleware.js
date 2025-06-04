import { AppError } from '../../../../utils/AppError.js';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { VacionesSolicitadas } from './vacionesSolicitadas.model.js';

export const validExistVacionesSolicitadas = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const vacionesSolicitada = await VacionesSolicitadas.findOne({
      where: {
        id,
      },
    });

    if (!vacionesSolicitada) {
      return next(
        new AppError(`the vacionesSolicitada  with id: ${id} not found `, 404)
      );
    }

    req.vacionesSolicitada = vacionesSolicitada;
    next();
  }
);
