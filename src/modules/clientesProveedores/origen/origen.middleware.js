import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Origen } from './origen.model.js';

export const validExistOrigen = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const origen = await Origen.findOne({
    where: {
      id,
    },
  });

  if (!origen) {
    return next(new AppError(`origen with id: ${id} not found `, 404));
  }

  req.origen = origen;
  next();
});
