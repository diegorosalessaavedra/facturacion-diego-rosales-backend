import { catchAsync } from '../../../../utils/catchAsync.js';
import { DescansoMedico } from './descansoMedico.model.js';

export const validExistDescansoMedico = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const descansoMedico = await DescansoMedico.findOne({
    where: {
      id,
    },
  });

  if (!descansoMedico) {
    return next(
      new AppError(`the descansoMedico  with id: ${id} not found `, 404)
    );
  }

  req.descansoMedico = descansoMedico;
  next();
});
