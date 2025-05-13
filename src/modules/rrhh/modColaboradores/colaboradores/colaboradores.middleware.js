import { catchAsync } from '../../../../utils/catchAsync.js';
import { Colaboradores } from './colaboradores.model.js';

export const validExistColaborador = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const colaborador = await Colaboradores.findOne({
    where: {
      id,
    },
  });

  if (!colaborador) {
    return next(
      new AppError(`the colaborador  with id: ${id} not found `, 404)
    );
  }

  req.colaborador = colaborador;
  next();
});
