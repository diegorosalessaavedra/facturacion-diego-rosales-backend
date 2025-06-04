import { catchAsync } from '../../../../utils/catchAsync.js';
import { DocCompleColaboradores } from './docCompleColaboradores.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const docCompleColaboradores = await DocCompleColaboradores.findAll();

  return res.status(200).json({
    status: 'Success',
    results: docCompleColaboradores.length,
    docCompleColaboradores,
  });
});
export const findOne = catchAsync(async (req, res, next) => {
  const { docCompleColaborador } = req;

  return res.status(200).json({
    status: 'Success',
    docCompleColaborador,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const { nombre_doc_complementario } = req.body;
    const docComplementario = req.file;

    if (!docComplementario) {
      await transaction.rollback();
      return next(
        new AppError('El documento complementario es obligatorio', 400)
      );
    }

    // Crear colaborador sin aún subir el archivo (pero dentro de la transacción)
    const docCompleColaborador = await DocCompleColaboradores.create(
      {
        nombre_doc_complementario,
      },
      { transaction }
    );

    let doc_complementario_path;

    try {
      const docComFormData = new FormData();
      docComFormData.append('file', docComplementario.buffer, {
        filename: docComplementario.originalname,
      });

      const uploadUrl = `${process.env.LARAVEL_URL}/api/colaboradores`;

      const response = await axios.post(uploadUrl, docComFormData, {
        headers: {
          ...docComFormData.getHeaders(),
        },
      });

      doc_complementario_path = response.data.name; // asignación sin `const`
    } catch (error) {
      await transaction.rollback();

      const message =
        error.response?.data?.message ||
        'Ocurrió un error al registrar al colaborador. Inténtalo nuevamente.';

      return next(new AppError(message, 500));
    }

    docCompleColaborador.link_doc_complementario = doc_complementario_path;
    await docCompleColaborador.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: 'El docCompleColaborador se registró correctamente!',
      docCompleColaborador,
    });
  } catch (error) {
    await transaction.rollback();
    return next(
      new AppError(
        'Ocurrió un error al registrar al colaborador. Inténtalo nuevamente.',
        500
      )
    );
  }
});

export const update = catchAsync(async (req, res) => {
  const { docCompleColaborador } = req;
  const { cargo } = req.body;

  await docCompleColaborador.update({
    cargo,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the docCompleColaborador information has been updated',
    docCompleColaborador,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { docCompleColaborador } = req;

  await docCompleColaborador.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The docCompleColaborador with id: ${docCompleColaborador.id} has been deleted`,
  });
});
