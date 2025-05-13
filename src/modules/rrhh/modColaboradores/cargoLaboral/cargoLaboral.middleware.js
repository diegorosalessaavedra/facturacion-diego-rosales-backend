import { catchAsync } from '../../../../utils/catchAsync.js';
import { CargoLaboral } from './cargoLaboral.model.js';

export const validExistCargoLaboral = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const cargoLaboral = await CargoLaboral.findOne({
    where: {
      id,
    },
  });

  if (!cargoLaboral) {
    return next(
      new AppError(`the cargoLaboral  with id: ${id} not found `, 404)
    );
  }

  req.cargoLaboral = cargoLaboral;
  next();
});
