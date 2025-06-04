import { catchAsync } from '../../../../utils/catchAsync.js';
import { Colaboradores } from '../../modColaboradores/colaboradores/colaboradores.model.js';
import { Vacaciones } from './vacaciones.model.js';

export const findCollaboradores = catchAsync(async (req, res, next) => {
  const colaboradores = await Colaboradores.findAll({
    include: [
      {
        model: Vacaciones,
        as: 'vacaciones',
      },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: colaboradores.length,
    colaboradores,
  });
});

export const findAll = catchAsync(async (req, res, next) => {
  const vacaciones = await Vacaciones.findAll();

  return res.status(200).json({
    status: 'Success',
    results: vacaciones.length,
    vacaciones,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { vacacion } = req;

  return res.status(200).json({
    status: 'Success',
    vacacion,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { id: colaborador_id } = req.params;
  const { periodo, dias_disponibles } = req.body;

  // Crear colaborador sin aún subir el archivo (pero dentro de la transacción)
  const vacacion = await Vacaciones.create({
    colaborador_id,
    periodo,
    dias_disponibles,
  });

  res.status(201).json({
    status: 'success',
    message: 'El cargoLaboral se registró correctamente!',
    vacacion,
  });
});

export const update = catchAsync(async (req, res) => {
  const { vacacion } = req;
  const { periodo, dias_disponibles } = req.body;

  await vacacion.update({
    periodo,
    dias_disponibles,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the vacacion information has been updated',
    vacacion,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { vacacion } = req;

  await vacacion.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The vacacion with id: ${vacacion.id} has been deleted`,
  });
});
