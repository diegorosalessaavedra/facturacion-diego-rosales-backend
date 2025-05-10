import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Origen } from './origen.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const origenes = await Origen.findAll();

  return res.status(200).json({
    status: 'Success',
    results: origenes.length,
    origenes,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { cliente } = req;

  return res.status(200).json({
    status: 'Success',
    cliente,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { nombre_origen, codigo_origen } = req.body;

  const existOrigen = await Origen.findOne({
    where: { codigo_origen },
  });

  if (existOrigen) {
    return next(
      new AppError(
        `El codigo de origen:${codigo_origen},  ya se  encuentra registrado`,
        400
      )
    );
  }

  const origen = await Origen.create({
    nombre_origen,
    codigo_origen,
  });

  res.status(201).json({
    status: 'success',
    message: 'El origen se agrego correctamente!',
    origen,
  });
});

export const update = catchAsync(async (req, res) => {
  const { origen } = req;
  const { nombre_origen, codigo_origen } = req.body;

  await origen.update({
    nombre_origen,
    codigo_origen,
  });

  return res.status(200).json({
    status: 'success',
    message: 'origen information has been updated',
    origen,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { origen } = req;

  await origen.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The origen with id: ${origen.id} has been deleted`,
  });
});
