import { catchAsync } from '../../../utils/catchAsync.js';
import { Encargados } from './encargados.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { cargo } = req.query;
  let whereEncargado = {};

  if (cargo && cargo.length > 3) {
    whereEncargado.cargo = cargo;
  }

  const encargados = await Encargados.findAll({
    where: whereEncargado,
    order: [['cargo', 'DESC']],
  });

  return res.status(200).json({
    status: 'Success',
    results: encargados.length,
    encargados,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { encargado } = req;

  return res.status(200).json({
    status: 'Success',
    encargado,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { nombre, cargo } = req.body;

  const encargado = await Encargados.create({
    nombre,
    cargo,
  });

  res.status(201).json({
    status: 'success',
    message: 'El encargado se agrego correctamente!',
    encargado,
  });
});

export const update = catchAsync(async (req, res) => {
  const { encargado } = req;
  const { nombre, cargo } = req.body;

  await encargado.update({
    nombre,
    cargo,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the encargado information has been updated',
    encargado,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { encargado } = req;

  await encargado.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The encargado with id: ${encargado.id} has been deleted`,
  });
});
