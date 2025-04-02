import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Huevos } from './huevos.model.js';

export const validExistHuevos = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const huevo = await Huevos.findOne({
    where: {
      id,
    },
  });

  if (!huevo) {
    return next(new AppError(`the huevo  with id: ${id} not found `, 404));
  }

  req.huevo = huevo;
  next();
});
