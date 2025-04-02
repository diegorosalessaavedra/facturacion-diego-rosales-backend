import { catchAsync } from '../../../utils/catchAsync.js';
import { Distritos } from './distritos.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const distritos = await Distritos.findAll({ where: { provinciaId: id } });

  return res.status(200).json({
    status: 'Success',
    results: distritos.length,
    distritos,
  });
});
