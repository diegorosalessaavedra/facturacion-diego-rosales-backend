import { db } from '../../../db/db.config.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosPago } from '../../ajustes/metodosPagos/metodosPago.model.js';
import { CostosProduccion } from '../../costos/costosProduccion/costosProduccion.model.js';
import { Huevos } from '../../productos/huevos/huevos.model.js';
import { PagosIngresoHuevos } from '../pagosIngresoHuevos/pagosIngresoHuevos.model.js';
import { IngresoHuevos } from './ingresoHuevos.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const ingresoHuevos = await IngresoHuevos.findAll({
    include: [
      { model: CostosProduccion, as: 'costo_produccion', attributes: ['id'] },
    ],
  });

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
    fecha_pedido,
    produccion,
    productos,
    arrayPagos,

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
    const ingresoHuevo = await IngresoHuevos.create(
      {
        fecha_pedido,
        produccion,

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
    await transaction.rollback();
    next(error);
  }
});

export const update = catchAsync(async (req, res, next) => {
  const { ingresoHuevo } = req;

  const {
    fecha_pedido,
    produccion,
    productos,
    arrayPagos,

    comprador,
    observacion,
  } = req.body;

  // Formatear el código de compra basado en la fecha y producción
  const partes = fecha_pedido.split('-');
  const formatoFinal = partes[2] + partes[1] + partes[0].slice(2); // "260325"
  const codigoCompra =
    produccion === 'SANTA ELENA' ? `SE-${formatoFinal}` : `PP-${formatoFinal}`;

  // Calcular el total de los productos
  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + Number(producto.total),
    0
  );

  const transaction = await db.transaction();

  try {
    // Actualizar el ingreso de huevo
    await ingresoHuevo.update(
      {
        codigo_compra: codigoCompra, // Usar solo el codigoCompra generado
        fecha_pedido,
        produccion,

        comprador,
        observacion,
        total_precio: totalPrecioProductos,
      },
      { transaction }
    );

    // Eliminar pagos anteriores
    await PagosIngresoHuevos.destroy({
      where: { ingreso_huevo_id: ingresoHuevo.id },
      transaction,
    });

    // Crear nuevos pagos
    const pagosPromises = arrayPagos.map(async (pago) => {
      const metodoPago = await MetodosPago.findOne({
        where: { id: pago.metodoPago },
      });

      if (!metodoPago) {
        throw new Error(
          `Método de pago con ID ${pago.metodoPago} no encontrado`
        );
      }

      return PagosIngresoHuevos.create(
        {
          ingreso_huevo_id: ingresoHuevo.id,
          metodoPago_id: metodoPago.id,
          operacion: pago.operacion,
          monto: pago.monto,
          fecha: pago.fecha,
        },
        { transaction }
      );
    });

    await Promise.all(pagosPromises);

    // Procesar los productos: actualizar existentes, crear nuevos
    const productosPromises = productos.map(async (producto) => {
      // Verificar si el producto ya existe
      const existingProduct = await Huevos.findOne({
        where: { id: producto.id },
        transaction,
      });

      if (existingProduct) {
        const totalStock =
          Number(existingProduct.cantidad) - Number(producto.cantidad);

        // Ajustar el stock según la diferencia sea positiva o negativa
        const nuevoStock =
          totalStock > 0
            ? Number(existingProduct.stock) - totalStock
            : Number(existingProduct.stock) + Number(Math.abs(totalStock));

        return existingProduct.update(
          {
            ingreso_huevos_id: ingresoHuevo.id,
            nombre_producto: producto.nombre_producto,
            zona_venta: producto.zona_venta,
            cantidad: producto.cantidad,
            precio_unitario: producto.precio_unitario,
            precio_sin_igv: producto.precio_sin_igv,
            total: producto.total,
            stock: nuevoStock >= 0 ? nuevoStock : 0, // Evitar stock negativo
          },
          { transaction }
        );
      } else {
        // Crear nuevo producto si no existe
        return Huevos.create(
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
    });

    await Promise.all(productosPromises);

    await transaction.commit();

    res.status(200).json({
      status: 'success',
      message: 'El ingreso de huevo se actualizó correctamente!',
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
