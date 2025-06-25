import { catchAsync } from '../../../../utils/catchAsync.js';
import { Contratos } from './contratos.model.js';

export const validExistContrato = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const contrato = await Contratos.findOne({
    where: {
      id,
    },
  });

  if (!contrato) {
    return next(new AppError(`the contrato  with id: ${id} not found `, 404));
  }

  req.contrato = contrato;
  next();
});
