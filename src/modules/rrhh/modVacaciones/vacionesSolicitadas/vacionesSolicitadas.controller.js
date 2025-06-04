import { AppError } from '../../../../utils/AppError.js';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { formatDate } from '../../../../utils/formateDate.js';
import { Colaboradores } from '../../modColaboradores/colaboradores/colaboradores.model.js';
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
  const { colaborador_id, fecha_inicio, fecha_final, motivo_vacaciones } =
    req.body;

  const dateFecha_inicio = new Date(fecha_inicio); // Asegúrate de que sean objetos Date
  const dateFecha_final = new Date(fecha_final); // Asegúrate de que sean objetos Date

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

  const vacionesSolicitada = await VacionesSolicitadas.create({
    colaborador_id,
    vacaciones_id,
    fecha_inicio: formatDate(fecha_inicio),
    fecha_final: formatDate(fecha_final),
    dias_totales,
    motivo_vacaciones,
  });

  res.status(201).json({
    status: 'success',
    message: 'El vacionesSolicitada se registró correctamente!',
    vacionesSolicitada,
  });
});

export const update = catchAsync(async (req, res) => {
  const { vacionesSolicitada } = req;
  const { cargo } = req.body;

  await vacionesSolicitada.update({
    cargo,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the vacionesSolicitada information has been updated',
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
