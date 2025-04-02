import { catchAsync } from '../../../utils/catchAsync.js';
import { CuentasBancarias } from './cuentasBancarias.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const cuentasBancarias = await CuentasBancarias.findAll();

  return res.status(200).json({
    status: 'Success',
    results: cuentasBancarias.length,
    cuentasBancarias,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { cuentaBancaria } = req;

  return res.status(200).json({
    status: 'Success',
    cuentaBancaria,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { banco, descripcion, numero, cci, moneda } = req.body;

  const cuentaBancaria = await CuentasBancarias.create({
    banco,
    descripcion,
    numero,
    cci,
    moneda,
  });

  res.status(201).json({
    status: 'success',
    message: 'La cuenta bancaria se agrego correctamente!',
    cuentaBancaria,
  });
});

export const update = catchAsync(async (req, res) => {
  const { cuentaBancaria } = req;
  const { banco, descripcion, numero, cci, moneda } = req.body;

  await cuentaBancaria.update({
    banco,
    descripcion,
    numero,
    cci,
    moneda,
  });

  return res.status(200).json({
    status: 'success',
    message: 'metodo Pago information has been updated',
    cuentaBancaria,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { cuentaBancaria } = req;

  await cuentaBancaria.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The cuentaBancaria with id: ${cuentaBancaria.id} has been deleted`,
  });
});
