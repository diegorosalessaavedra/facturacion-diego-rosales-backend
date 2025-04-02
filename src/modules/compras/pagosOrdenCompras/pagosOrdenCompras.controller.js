import { catchAsync } from '../../../utils/catchAsync.js';
import { PagosOrdenCompras } from './pagosOrdenCompras.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const pagosOrdenCompras = await PagosOrdenCompras.findAll();

  return res.status(200).json({
    status: 'Success',
    results: pagosOrdenCompras.length,
    pagosOrdenCompras,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { pagoOrdenCompra } = req;

  return res.status(200).json({
    status: 'Success',
    pagoOrdenCompra,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { nombepagosOrdenCompra } = req.body;

  const pagoOrdenCompra = await PagosOrdenCompras.create({
    nombepagosOrdenCompra,
  });

  res.status(201).json({
    status: 'success',
    message: 'La pagoOrdenCompra se agrego correctamente!',
    pagoOrdenCompra,
  });
});

export const update = catchAsync(async (req, res) => {
  const { pagoOrdenCompra } = req;
  const { descripcion } = req.body;

  await pagoOrdenCompra.update({
    descripcion,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the pagoOrdenCompra information has been updated',
    pagoOrdenCompra,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { pagoOrdenCompra } = req;

  await pagoOrdenCompra.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The pagoOrdenCompra with id: ${pagoOrdenCompra.id} has been deleted`,
  });
});
