import { Op, Sequelize } from 'sequelize';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ComprobantesOrdenCompras } from '../../compras/comprobantesOrdenCompras/comprobantesOrdenCompras.model.js';
import { ProductosComprobanteOrdenCompras } from '../../compras/productosComprobanteOrdenCompras/productosComprobanteOrdenCompras.model.js';
import { ComprobantesElectronicos } from '../../comprobantes/filesComprobanteElectronicos/comprobantesElectronicos/comprobantesElectronicos.model.js';
import { ProductosComprobanteElectronico } from '../../comprobantes/filesComprobanteElectronicos/productosComprobanteElectronico/productosComprobanteElectronico.model.js';
import { NotasComprobante } from '../../comprobantes/filesNotasComprobante/notasComprobante/notasComprobante.model.js';
import { MisProductos } from './misProductos.model.js';
import { Proveedores } from '../../clientesProveedores/proveedores/proveedores.model.js';
import { ProductosNotasComprobante } from '../../comprobantes/filesNotasComprobante/productosNotasComprobante/productosNotasComprobante.model.js';
import { SaldoInicialKardex } from '../saldoInicialKardex/saldoInicialKardex.model.js';
import {
  calculatePreviousMonth,
  formatToUTC,
  misProductosKardex,
} from './functionsMisProductos.js';

export const findAll = catchAsync(async (req, res, next) => {
  const misProductos = await MisProductos.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: misProductos.length,
    misProductos,
  });
});

export const findAllKardex = catchAsync(async (req, res, next) => {
  const { mes, year } = req.query;

  let dateCondition = {};
  let dateNota = {};

  let startDate;
  let endDate;
  const fechaActual = new Date();

  if (mes && year) {
    startDate = new Date(`${year}-${mes}-01`);
    endDate = new Date(year, mes, 0);

    dateCondition = {
      fechaEmision: {
        [Op.between]: [startDate, endDate],
      },
    };
    dateNota = {
      fecha_emision: {
        [Op.between]: [startDate, endDate],
      },
    };
  }

  const previousMonth = calculatePreviousMonth(endDate);
  const previousMonthUtc = formatToUTC(previousMonth);

  const misProductos = await MisProductos.findAll({
    attributes: ['id', 'nombre', 'categoria', 'codigoSunat', 'codigoInterno'],

    include: [
      {
        model: SaldoInicialKardex,
        required: false,
        where: {
          fecha: previousMonthUtc,
        },
      },
      {
        model: ProductosComprobanteElectronico,
        as: 'productosComprobante',
        include: [
          {
            model: ComprobantesElectronicos,
            attributes: [
              'id',
              'serie',
              'numeroSerie',
              'fechaEmision',
              'tipoComprobante',
            ],

            required: true,
            where: {
              estado: 'ACEPTADA',
              ...dateCondition,
            },
          },
        ],
      },
      {
        model: ProductosComprobanteOrdenCompras,
        as: 'productosComprobanteOrden',
        include: [
          {
            model: ComprobantesOrdenCompras,
            attributes: ['id', 'serie', 'fechaEmision', 'tipoComprobante'],

            required: true,
            where: {
              status: 'Activo',
              ...dateCondition,
            },
            include: [{ model: Proveedores, as: 'proveedor' }],
          },
        ],
      },
      {
        model: ProductosNotasComprobante,
        as: 'productosNotas',
        include: [
          {
            model: NotasComprobante,
            attributes: [
              'id',
              'serie',
              'numero_serie',
              'fecha_emision',
              'tipo_nota',
            ],

            required: true,
            where: {
              estado: 'ACEPTADA',
              ...dateNota,
            },
          },
        ],
      },
    ],
  });

  if (fechaActual.getTime() > endDate.getTime()) {
    misProductosKardex(misProductos, formatToUTC(endDate));
  }

  return res.status(200).json({
    status: 'Success',
    results: misProductos.length,
    misProductos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { miProducto } = req;

  return res.status(200).json({
    status: 'Success',
    miProducto,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const {
    nombre,
    categoria,
    precioUnitario,
    codigoSunat,
    codigoInterno,
    codigoCompra,
    codigoVenta,
    incluyeIgv,
    conStock,
    codUnidad,
  } = req.body;
  console.log(conStock);

  const miProducto = await MisProductos.create({
    nombre,
    categoria,
    precioUnitario,
    codigoSunat,
    codigoInterno,
    codigoCompra,
    codigoVenta,
    incluyeIgv,
    conStock,
    codUnidad,
  });

  res.status(201).json({
    status: 'success',
    message: 'El Producto se agrego correctamente!',
    miProducto,
  });
});

export const update = catchAsync(async (req, res) => {
  const { miProducto } = req;
  const {
    nombre,
    categoria,
    precioUnitario,
    stock,
    codigoSunat,
    codigoInterno,
    codigoCompra,
    codigoVenta,
    incluyeIgv,
    conStock,
    codUnidad,
  } = req.body;

  await miProducto.update({
    nombre,
    categoria,
    precioUnitario,
    stock,
    codigoSunat,
    codigoInterno,
    codigoCompra,
    codigoVenta,
    incluyeIgv,
    conStock,
    codUnidad,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the mi Producto information has been updated',
    miProducto,
  });
});
//hola

export const deleteElement = catchAsync(async (req, res) => {
  const { miProducto } = req;

  await miProducto.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The miProducto with id: ${miProducto.id} has been deleted`,
  });
});
