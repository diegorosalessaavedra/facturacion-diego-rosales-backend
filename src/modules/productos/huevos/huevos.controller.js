import { Op } from 'sequelize';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Huevos } from './huevos.model.js';
import { IngresoHuevos } from '../../compras/ingresoHuevos/ingresoHuevos.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { produccion, stock, fecha_inicial, fecha_final } = req.query;

  let whereFilters = {};
  let whereIngreso = {};

  if (stock !== 'false') {
    whereFilters.stock = { [Op.gt]: 1 };
  }

  if (produccion && produccion !== 'TODOS') {
    whereIngreso.produccion = { [Op.eq]: produccion }; // ENUM solo acepta valores exactos
  }

  if (fecha_inicial && fecha_final) {
    whereIngreso.fecha_pedido = {
      [Op.between]: [fecha_inicial, fecha_final],
    };
  }

  const huevos = await Huevos.findAll({
    where: whereFilters,
    include: [
      {
        model: IngresoHuevos,
        where: whereIngreso,
        as: 'ingreso_huevos',
      },
    ],
    order: [['ingreso_huevos', 'fecha_pedido', 'DESC']],
  });

  return res.status(200).json({
    status: 'Success',
    results: huevos.length,
    huevos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { huevo } = req;

  return res.status(200).json({
    status: 'Success',
    huevo,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { compra_id, cantidad, stock, precio_sin_igv, total } = req.body;

  const huevo = await Huevos.create({
    compra_id,
    cantidad,
    stock,
    precio_sin_igv,
    total,
  });

  res.status(201).json({
    status: 'success',
    message: 'El huevo se agrego correctamente!',
    huevo,
  });
});

export const update = catchAsync(async (req, res) => {
  const { huevo } = req;
  const { compra_id, cantidad, stock, precio_sin_igv, total } = req.body;

  await huevo.update({
    compra_id,
    cantidad,
    stock,
    precio_sin_igv,
    total,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the mi huevo information has been updated',
    huevo,
  });
});
//hola

export const deleteElement = catchAsync(async (req, res) => {
  const { huevo } = req;

  await huevo.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The huevo with id: ${huevo.id} has been deleted`,
  });
});
