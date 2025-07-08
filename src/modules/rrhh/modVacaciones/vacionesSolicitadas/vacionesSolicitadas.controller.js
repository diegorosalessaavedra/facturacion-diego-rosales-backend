import { db } from '../../../../db/db.config.js';
import { AppError } from '../../../../utils/AppError.js';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { formatDate } from '../../../../utils/formateDate.js';
import { sendConfirmationEmail } from '../../../../utils/nodemailer.js';
import { Colaboradores } from '../../modColaboradores/colaboradores/colaboradores.model.js';
import { Vacaciones } from '../vacaciones/vacaciones.model.js';
import {
  deleteVacacionesFileFromLaravel,
  uploadVacacionesFileToLaravel,
} from './vacacionesSolicitadas.services.js';
import { VacionesSolicitadas } from './vacionesSolicitadas.model.js';

export const findAllPeriodo = catchAsync(async (req, res, next) => {
  const { id: vacaciones_id } = req.params;

  const vacionesSolicitadas = await VacionesSolicitadas.findAll({
    where: { vacaciones_id },
  });

  return res.status(200).json({
    status: 'Success',
    results: vacionesSolicitadas.length,
    vacionesSolicitadas,
  });
});

export const findAllColaborador = catchAsync(async (req, res, next) => {
  const { id: colaborador_id } = req.params;

  const vacionesSolicitadas = await VacionesSolicitadas.findAll({
    where: { colaborador_id },
  });

  return res.status(200).json({
    status: 'Success',
    results: vacionesSolicitadas.length,
    vacionesSolicitadas,
  });
});

export const findAll = catchAsync(async (req, res, next) => {
  const vacionesSolicitadas = await VacionesSolicitadas.findAll({
    include: [
      {
        model: Colaboradores,
        as: 'colaborador',
      },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: vacionesSolicitadas.length,
    vacionesSolicitadas,
  });
});
export const findOne = catchAsync(async (req, res, next) => {
  const { vacionesSolicitada } = req;

  return res.status(200).json({
    status: 'Success',
    vacionesSolicitada,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { vacacion } = req;
  const { id: vacaciones_id } = req.params;
  const { colaborador_id, fecha_inicio, fecha_final } = req.body;

  const file = req.file;

  // 1. Validaciones iniciales
  if (!file) {
    return next(new AppError('No se ha subido ningún archivo.', 400));
  }

  const transaction = await db.transaction();
  let uploadedFilename = null;

  const fecha_hoy = new Date().toLocaleDateString('es-PE');
  const dateFecha_inicio = new Date(fecha_inicio);
  const dateFecha_final = new Date(fecha_final);

  const diferenciaEnMilisegundos =
    dateFecha_final.getTime() - dateFecha_inicio.getTime();

  const milisegundosEnUnDia = 1000 * 60 * 60 * 24;
  const dias_totales =
    Math.ceil(diferenciaEnMilisegundos / milisegundosEnUnDia) + 1;

  if (dias_totales > vacacion.dias_disponibles) {
    return next(
      new AppError(
        `Solo puede solicitar ${vacacion.dias_disponibles} días como máximo de vacaciones.`,
        400 // Changed to 400 Bad Request as it's a client error
      )
    );
  }
  try {
    uploadedFilename = await uploadVacacionesFileToLaravel(file);

    const vacionesSolicitada = await VacionesSolicitadas.create(
      {
        colaborador_id,
        vacaciones_id,
        fecha_solicitud: fecha_hoy,
        fecha_inicio: formatDate(fecha_inicio),
        fecha_final: formatDate(fecha_final),
        dias_totales,
        solicitud_adjunto: uploadedFilename,
      },
      { transaction }
    );
    await transaction.commit();
    const findVacacionesSolicitada = await VacionesSolicitadas.findOne({
      where: { id: vacionesSolicitada.id },
      include: [{ model: Colaboradores, as: 'colaborador' }],
    });

    sendConfirmationEmail(findVacacionesSolicitada);

    res.status(201).json({
      status: 'success',
      message: 'El vacionesSolicitada se registró correctamente!',
      vacionesSolicitada,
    });
  } catch (error) {
    console.error('Error en la transacción de creación de contrato:', error);

    if (transaction) {
      await transaction.rollback();
    }

    if (uploadedFilename) {
      await deleteVacacionesFileFromLaravel(uploadedFilename);
    }

    const message =
      'Ocurrió un error al solicitar las vacaciones. Inténtalo nuevamente.';

    return next(new AppError(message, error.statusCode || 500));
  }
});

export const update = catchAsync(async (req, res) => {
  const { vacionesSolicitada } = req;
  const { pendiente_autorizacion } = req.body;

  // Actualizar solicitud de vacaciones

  const vacaciones = await Vacaciones.findByPk(
    vacionesSolicitada.vacaciones_id
  );

  if (pendiente_autorizacion === 'ACEPTADO') {
    const nuevosDias =
      Number(vacaciones.dias_disponibles) -
      Number(vacionesSolicitada.dias_totales);

    await vacaciones.update({
      dias_disponibles: nuevosDias,
    });
  } else if (
    vacionesSolicitada.pendiente_autorizacion === 'ACEPTADO' &&
    pendiente_autorizacion === 'ANULADO'
  ) {
    const nuevosDias =
      Number(vacaciones.dias_disponibles) +
      Number(vacionesSolicitada.dias_totales);

    await vacaciones.update({
      dias_disponibles: nuevosDias,
    });
  }
  await vacionesSolicitada.update({
    pendiente_autorizacion,
  });

  return res.status(200).json({
    status: 'success',
    message: 'La solicitud de vacaciones fue actualizada correctamente',
    vacionesSolicitada,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { vacionesSolicitada } = req;

  await vacionesSolicitada.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The vacionesSolicitada with id: ${vacionesSolicitada.id} has been deleted`,
  });
});
