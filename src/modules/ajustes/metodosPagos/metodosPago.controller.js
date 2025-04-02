import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosPago } from './metodosPago.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const metodosPago = await MetodosPago.findAll();

  return res.status(200).json({
    status: 'Success',
    results: metodosPago.length,
    metodosPago,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { metodoPago } = req;

  return res.status(200).json({
    status: 'Success',
    metodoPago,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { metodo_pago, banco, numero, descripcion, condicionPago } = req.body;

  const metodoPago = await MetodosPago.create({
    metodo_pago,
    banco,
    numero,
    descripcion,
    condicionPago,
  });

  res.status(201).json({
    status: 'success',
    message: 'El metodo de Pago se agrego correctamente!',
    metodoPago,
  });
});

export const update = catchAsync(async (req, res) => {
  const { metodoPago } = req;
  const { metodo_pago, banco, numero, descripcion, condicionPago } = req.body;

  await metodoPago.update({
    metodo_pago,
    banco,
    numero,
    descripcion,
    condicionPago,
  });

  return res.status(200).json({
    status: 'success',
    message: 'metodo Pago information has been updated',
    metodoPago,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { metodoPago } = req;

  await metodoPago.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The metodoPago with id: ${metodoPago.id} has been deleted`,
  });
});
