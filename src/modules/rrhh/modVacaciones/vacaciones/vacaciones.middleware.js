import { catchAsync } from '../../../../utils/catchAsync.js';
import { Vacaciones } from './vacaciones.model.js';

export const validExistVacaciones = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const vacacion = await Vacaciones.findOne({
    where: {
      id,
    },
  });

  if (!vacacion) {
    return next(new AppError(`the vacacion  with id: ${id} not found `, 404));
  }

  req.vacacion = vacacion;
  next();
});
