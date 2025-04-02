import { Op, fn, col, literal } from 'sequelize';
import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Clientes } from './clientes.model.js';
import { db } from '../../../db/db.config.js';

export const findAll = catchAsync(async (req, res, next) => {
  const clientes = await Clientes.findAll();

  return res.status(200).json({
    status: 'Success',
    results: clientes.length,
    clientes,
  });
});

export const findAllGraficoCompras = catchAsync(async (req, res, next) => {
  try {
    const [clientes, metadata] = await db.query(`
      SELECT "clientes".*, COUNT("cotizaciones"."id") AS "cotizaciones_count"
      FROM "clientes"
      LEFT OUTER JOIN "cotizaciones" ON "clientes"."id" = "cotizaciones"."clienteId"
      GROUP BY "clientes"."id"
      ORDER BY "cotizaciones_count" DESC
      LIMIT 20;
    `);

    return res.status(200).json({
      status: 'Success',
      results: clientes.length,
      clientes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'Error',
      message: error.message,
    });
  }
});

export const getClientesRegistradosPorMes = catchAsync(
  async (req, res, next) => {
    const fechaInicio = new Date(new Date().getFullYear(), 0, 1); // 1 de enero del año actual
    const fechaFin = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59); // 31 de diciembre del año actual

    const clientesPorMes = await Clientes.findAll({
      where: {
        createdAt: {
          [Op.between]: [fechaInicio, fechaFin], // Rango de fechas
        },
      },
      order: [['createdAt', 'ASC']], // Orden ascendente por fecha de creación
    });

    return res.status(200).json({
      status: 'Success',
      clientesPorMes,
    });
  }
);

export const findOne = catchAsync(async (req, res, next) => {
  const { cliente } = req;

  return res.status(200).json({
    status: 'Success',
    cliente,
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

  const existCliente = await Clientes.findOne({
    where: { numeroDoc },
  });

  if (existCliente) {
    return next(
      new AppError(
        `El cliente con el numero de DNI,CE,RUC o pasaporte ya se encuentra registrado`,
        400
      )
    );
  }

  const cliente = await Clientes.create({
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
    message: 'El cliente se agrego correctamente!',
    cliente,
  });
});

export const update = catchAsync(async (req, res) => {
  const { cliente } = req;
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

  await cliente.update({
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
    message: 'cliente information has been updated',
    cliente,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { cliente } = req;

  await cliente.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The cliente with id: ${cliente.id} has been deleted`,
  });
});
