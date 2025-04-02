import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Proveedores } from './proveedores.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const proveedores = await Proveedores.findAll();

  return res.status(200).json({
    status: 'Success',
    results: proveedores.length,
    proveedores,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { proveedor } = req;

  return res.status(200).json({
    status: 'Success',
    proveedor,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const {
    tipoDocIdentidad,
    numeroDoc,
    nombreApellidos,
    nombreComercial,
    departamentoId,
    provinciaId,
    distritoId,
    direccion,
    telefono,
  } = req.body;

  const existeproveedor = await Proveedores.findOne({
    where: { numeroDoc },
  });

  if (existeproveedor) {
    return next(
      new AppError(
        `El proveedor con el numero de DNI,CE,RUC o pasaporte ya se encuentra registrado`,
        400
      )
    );
  }

  const proveedor = await Proveedores.create({
    tipoDocIdentidad,
    numeroDoc,
    nombreApellidos,
    nombreComercial,
    departamentoId,
    provinciaId,
    distritoId,
    direccion,
    telefono,
  });

  res.status(201).json({
    status: 'success',
    message: 'El proveedor se agrego correctamente!',
    proveedor,
  });
});

export const update = catchAsync(async (req, res) => {
  const { proveedor } = req;
  const {
    tipoDocIdentidad,
    numeroDoc,
    nombreApellidos,
    nombreComercial,
    departamentoId,
    provinciaId,
    distritoId,
    direccion,
    telefono,
  } = req.body;

  await proveedor.update({
    tipoDocIdentidad,
    numeroDoc,
    nombreApellidos,
    nombreComercial,
    departamentoId,
    provinciaId,
    distritoId,
    direccion,
    telefono,
  });

  return res.status(200).json({
    status: 'success',
    message: 'proveedor information has been updated',
    proveedor,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { proveedor } = req;

  await proveedor.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The proveedor with id: ${proveedor.id} has been deleted`,
  });
});
