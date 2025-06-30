import { db } from '../../../../db/db.config.js';
import { AppError } from '../../../../utils/AppError.js';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { Memos } from './memos.model.js';
import {
  deleteMemoFileFromLaravel,
  uploadMemoFileToLaravel,
} from './memos.services.js';

export const findAll = catchAsync(async (req, res, next) => {
  const contratos = await Memos.findAll();

  return res.status(200).json({
    status: 'Success',
    results: contratos.length,
    contratos,
  });
});
export const findOne = catchAsync(async (req, res, next) => {
  const { contrato } = req;

  return res.status(200).json({
    status: 'Success',
    contrato,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { id: colaborador_id } = req.params;
  const file = req.file;

  // 1. Validaciones iniciales
  if (!file) {
    return next(new AppError('No se ha subido ningún archivo.', 400));
  }

  let transaction;
  let uploadedFilename = null;

  try {
    const transaction = await db.transaction();
    // 2. Subir el archivo primero
    uploadedFilename = await uploadMemoFileToLaravel(file);

    const contrato = await Memos.create(
      {
        colaborador_id,
        documento_memo: uploadedFilename,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: 'El contrato y las vacaciones se registraron correctamente.',
      contrato,
    });
  } catch (error) {
    console.error('Error en la transacción de creación de contrato:', error);

    if (transaction) {
      await transaction.rollback();
    }

    if (uploadedFilename) {
      await deleteMemoFileFromLaravel(uploadedFilename);
    }

    const message =
      'Ocurrió un error al registrar el memo. Inténtalo nuevamente.';

    return next(new AppError(message, error.statusCode || 500));
  }
});

export const update = catchAsync(async (req, res) => {
  const { contrato } = req;
  const { fecha_inicio, fecha_final, archivo_adjunto } = req.body;

  await contrato.update({
    fecha_inicio,
    fecha_final,
    archivo_adjunto,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the contrato information has been updated',
    contrato,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { contrato } = req;

  await contrato.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The contrato with id: ${contrato.id} has been deleted`,
  });
});
