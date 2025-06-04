import { catchAsync } from '../../../../utils/catchAsync.js';
import { DocCompleColaboradores } from './docCompleColaboradores.model.js';

export const validExistDocCompleColaborador = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const docCompleColaborador = await DocCompleColaboradores.findOne({
      where: {
        id,
      },
    });

    if (!docCompleColaborador) {
      return next(
        new AppError(`the docCompleColaborador  with id: ${id} not found `, 404)
      );
    }

    req.docCompleColaborador = docCompleColaborador;
    next();
  }
);
