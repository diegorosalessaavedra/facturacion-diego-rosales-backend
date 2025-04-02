import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosGasto } from './metodosGastos.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const metodosGasto = await MetodosGasto.findAll();

  return res.status(200).json({
    status: 'Success',
    results: metodosGasto.length,
    metodosGasto,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { metodoGasto } = req;

  return res.status(200).json({
    status: 'Success',
    metodoGasto,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { descripcion } = req.body;

  const metodoGasto = await MetodosGasto.create({
    descripcion,
  });

  res.status(201).json({
    status: 'success',
    message: 'El metodoGasto se agrego correctamente!',
    metodoGasto,
  });
});

export const update = catchAsync(async (req, res) => {
  const { metodoGasto } = req;
  const { descripcion } = req.body;

  await metodoGasto.update({
    descripcion,
  });

  return res.status(200).json({
    status: 'success',
    message: 'metodoGasto information has been updated',
    metodoGasto,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { metodoGasto } = req;

  await metodoGasto.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The metodoGasto with id: ${metodoGasto.id} has been deleted`,
  });
});
