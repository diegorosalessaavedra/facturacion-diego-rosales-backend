import { db } from '../../../../db/db.config.js';
import { AppError } from '../../../../utils/AppError.js';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { formatDate } from '../../../../utils/formateDate.js';
import { Vacaciones } from '../../modVacaciones/vacaciones/vacaciones.model.js';
import { Contratos } from './contratos.model.js';
import {
  calcularDiasPorPeriodoAnual,
  deleteFileFromLaravel,
  uploadFileToLaravel,
} from './contratos.services.js';

export const findAll = catchAsync(async (req, res, next) => {
  const contratos = await Contratos.findAll();

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
  const { tipo_contrato, fecha_inicio, fecha_final } = req.body;
  const file = req.file;

  // 1. Validaciones iniciales
  if (!file) {
    return next(new AppError('No se ha subido ningún archivo.', 400));
  }
  if (!fecha_inicio || !fecha_final) {
    return next(
      new AppError('Las fechas de inicio y final son requeridas.', 400)
    );
  }

  let transaction;
  let uploadedFilename = null;

  try {
    const transaction = await db.transaction();
    // 2. Subir el archivo primero
    uploadedFilename = await uploadFileToLaravel(file);

    // 3. Iniciar la transacción de la base de datos

    // 4. Crear el contrato
    const contrato = await Contratos.create(
      {
        colaborador_id,
        tipo_contrato,
        fecha_inicio: formatDate(fecha_inicio), // Asumo que tienes una función formatDate
        fecha_final: formatDate(fecha_final),
        documento_contrato: uploadedFilename,
        // archivo_adjunto no estaba definido en tu código original, lo he omitido.
        // Si es necesario, asegúrate de pasarlo en el body: const { fecha_inicio, fecha_final, archivo_adjunto } = req.body;
      },
      { transaction }
    );

    // 5. Calcular y crear los registros de vacaciones
    const desglose_dias_por_anio = calcularDiasPorPeriodoAnual(
      fecha_inicio,
      fecha_final
    );

    const vacacionesPromises = desglose_dias_por_anio.map((desglose) =>
      Vacaciones.create(
        {
          colaborador_id,
          contrato_id: contrato.id,
          periodo: desglose.anio,
          dias_disponibles: desglose.dias_disponibles,
        },
        { transaction }
      )
    );

    await Promise.all(vacacionesPromises);

    // 6. Si todo fue exitoso, confirmar la transacción
    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: 'El contrato y las vacaciones se registraron correctamente.',
      contrato,
    });
  } catch (error) {
    // 7. Manejo de errores
    console.error('Error en la transacción de creación de contrato:', error);

    // Si la transacción se inició, hacer rollback
    if (transaction) {
      await transaction.rollback();
    }

    // Si el archivo se subió pero la transacción falló, eliminar el archivo huérfano
    if (uploadedFilename) {
      await deleteFileFromLaravel(uploadedFilename);
    }

    // Devolver un error claro al cliente
    const message =
      'Ocurrió un error al registrar el contrato. Inténtalo nuevamente.';

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

  await deleteFileFromLaravel(contrato.documento_contrato);

  return res.status(200).json({
    status: 'success',
    message: `The contrato with id: ${contrato.id} has been deleted`,
  });
});
