import { catchAsync } from '../../../utils/catchAsync.js';
import { Provincias } from './provincias.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const provincias = await Provincias.findAll({
    where: {
      departamentoId: id,
    },
  });

  return res.status(200).json({
    status: 'Success',
    results: provincias.length,
    provincias,
  });
});
