import { catchAsync } from '../../../../utils/catchAsync.js';
import { CargoLaboral } from './cargoLaboral.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const cargoLaborales = await CargoLaboral.findAll();

  return res.status(200).json({
    status: 'Success',
    results: cargoLaborales.length,
    cargoLaborales,
  });
});
export const findOne = catchAsync(async (req, res, next) => {
  const { cargoLaboral } = req;

  return res.status(200).json({
    status: 'Success',
    cargoLaboral,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { cargo } = req.body;

  // Crear colaborador sin aún subir el archivo (pero dentro de la transacción)
  const cargoLaboral = await CargoLaboral.create({
    cargo,
  });

  res.status(201).json({
    status: 'success',
    message: 'El cargoLaboral se registró correctamente!',
    cargoLaboral,
  });
});

export const update = catchAsync(async (req, res) => {
  const { cargoLaboral } = req;
  const { cargo } = req.body;

  await cargoLaboral.update({
    cargo,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the cargoLaboral information has been updated',
    cargoLaboral,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { cargoLaboral } = req;

  await cargoLaboral.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The cargoLaboral with id: ${cargoLaboral.id} has been deleted`,
  });
});
