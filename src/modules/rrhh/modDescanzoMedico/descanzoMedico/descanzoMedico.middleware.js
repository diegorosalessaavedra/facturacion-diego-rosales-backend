import { catchAsync } from '../../../../utils/catchAsync.js';
import { DescanzoMedico } from './descanzoMedico.model.js';

export const validExistDescanzoMedico = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const descanzoMedico = await DescanzoMedico.findOne({
    where: {
      id,
    },
  });

  if (!descanzoMedico) {
    return next(
      new AppError(`the descanzoMedico  with id: ${id} not found `, 404)
    );
  }

  req.descanzoMedico = descanzoMedico;
  next();
});
