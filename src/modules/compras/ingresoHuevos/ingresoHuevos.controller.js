import { db } from '../../../db/db.config.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosPago } from '../../ajustes/metodosPagos/metodosPago.model.js';
import { Huevos } from '../../productos/huevos/huevos.model.js';
import { PagosIngresoHuevos } from '../pagosIngresoHuevos/pagosIngresoHuevos.model.js';
import { IngresoHuevos } from './ingresoHuevos.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const ingresoHuevos = await IngresoHuevos.findAll();

  return res.status(200).json({
    status: 'Success',
    results: ingresoHuevos.length,
    ingresoHuevos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { ingresoHuevo } = req;

  return res.status(200).json({
    status: 'Success',
    ingresoHuevo,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const {
    codigo_compra,
    fecha_pedido,
    produccion,
    productos,
    arrayPagos,
    autorizado,
    comprador,
    observacion,
  } = req.body;

  console.log(req.body);

  const partes = fecha_pedido.split('-');
  const formatoFinal = partes[2] + partes[1] + partes[0].slice(2); // "260325"

  const codigoCompra =
    produccion === 'SANTA ELENA' ? `SE-${formatoFinal}` : `PP-${formatoFinal}`;

  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + Number(producto.total),
    0
  );
  const transaction = await db.transaction();
  try {
    const ingresoHuevo = await IngresoHuevos.create(
      {
        codigo_compra,
        fecha_pedido,
        produccion,
        autorizado,
        comprador,
        codigo_compra: codigoCompra,
        observacion,
        total_precio: totalPrecioProductos,
      },
      { transaction }
    );

    for (const pago of arrayPagos) {
      const metodoPago = await MetodosPago.findOne({
        where: { id: pago.metodoPago },
      });

      if (!metodoPago) {
        throw new Error('Método de pago no encontrado');
      }

      await PagosIngresoHuevos.create(
        {
          ingreso_huevo_id: ingresoHuevo.id,
          metodoPago_id: metodoPago.id,
          operacion: pago.operacion,
          monto: pago.monto,
          fecha: pago.fecha,
        },
        { transaction }
      );
    }

    for (const producto of productos) {
      await Huevos.create(
        {
          ingreso_huevos_id: ingresoHuevo.id,
          nombre_producto: producto.nombre_producto,
          zona_venta: producto.zona_venta,
          cantidad: producto.cantidad,
          precio_unitario: producto.precio_unitario,
          precio_sin_igv: producto.precio_sin_igv,
          total: producto.total,
          stock: producto.cantidad,
        },
        { transaction }
      );
    }

    await transaction.commit(); // ✅ Confirmar cambios si todo va bien

    res.status(201).json({
      status: 'success',
      message: 'El ingreso de huevo se agregó correctamente!',
      ingresoHuevo,
    });
  } catch (error) {
    console.log(error);

    await transaction.rollback();
    next(error);
  }
});

export const update = catchAsync(async (req, res, next) => {
  const { ingresoHuevo } = req;

  const {
    codigo_compra,
    fecha_pedido,
    produccion,
    productos,
    arrayPagos,
    autorizado,
    comprador,
    observacion,
  } = req.body;
  const partes = fecha_pedido.split('-');
  const formatoFinal = partes[2] + partes[1] + partes[0].slice(2); // "260325"

  const codigoCompra =
    produccion === 'SANTA ELENA' ? `SE-${formatoFinal}` : `PP-${formatoFinal}`;

  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + Number(producto.total),
    0
  );
  const transaction = await db.transaction();
  try {
    await ingresoHuevo.update(
      {
        codigo_compra,
        fecha_pedido,
        produccion,
        autorizado,
        comprador,
        codigo_compra: codigoCompra,
        observacion,
        total_precio: totalPrecioProductos,
      },
      { transaction }
    );

    await PagosIngresoHuevos.destroy({
      where: { ingreso_huevo_id: ingresoHuevo.id },
      transaction,
    });
    await Huevos.destroy({
      where: { ingreso_huevos_id: ingresoHuevo.id },
      transaction,
    });

    for (const pago of arrayPagos) {
      const metodoPago = await MetodosPago.findOne({
        where: { id: pago.metodoPago },
      });

      if (!metodoPago) {
        throw new Error('Método de pago no encontrado');
      }

      await PagosIngresoHuevos.create(
        {
          ingreso_huevo_id: ingresoHuevo.id,
          metodoPago_id: metodoPago.id,
          operacion: pago.operacion,
          monto: pago.monto,
          fecha: pago.fecha,
        },
        { transaction }
      );
    }

    for (const producto of productos) {
      await Huevos.create(
        {
          ingreso_huevos_id: ingresoHuevo.id,
          nombre_producto: producto.nombre_producto,
          zona_venta: producto.zona_venta,
          cantidad: producto.cantidad,
          precio_unitario: producto.precio_unitario,
          precio_sin_igv: producto.precio_sin_igv,
          total: producto.total,
          stock: producto.cantidad,
        },
        { transaction }
      );
    }

    await transaction.commit(); // ✅ Confirmar cambios si todo va bien

    res.status(201).json({
      status: 'success',
      message: 'El ingreso de huevo se agregó correctamente!',
      ingresoHuevo,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

export const deleteElement = catchAsync(async (req, res) => {
  const { ingresoHuevo } = req;

  await ingresoHuevo.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The ingresoHuevo with id: ${ingresoHuevo.id} has been deleted`,
  });
});
