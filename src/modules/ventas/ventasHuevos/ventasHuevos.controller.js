import { Op, where } from 'sequelize';
import { db } from '../../../db/db.config.js';
import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosPago } from '../../ajustes/metodosPagos/metodosPago.model.js';
import { Huevos } from '../../productos/huevos/huevos.model.js';
import { PagosVentaHuevos } from '../pagosVentaHuevos/pagosVentaHuevos.model.js';
import { ProductosVentaHuevos } from '../productosVentaHuevos/productosVentaHuevos.model.js';
import { VentasHuevos } from './ventasHuevos.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { fecha_solicitud, fecha_final, cliente, estado } = req.query;

  let whereFilters = {};
  if (fecha_solicitud) {
    whereFilters.fecha_solicitud = {
      [Op.between]: [fecha_solicitud, fecha_final],
    };
  }

  if (cliente && cliente.trim().length > 0) {
    whereFilters.cliente = { [Op.iLike]: `%${cliente}%` };
  }
  if (estado && estado.trim().length > 0) {
    whereFilters.estado = { [Op.iLike]: `%${estado}%` };
  }

  const ventasHuevos = await VentasHuevos.findAll({
    where: whereFilters,
    order: [
      ['fecha_solicitud', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: ventasHuevos.length,
    ventasHuevos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { ventaHuevo } = req;

  return res.status(200).json({
    status: 'Success',
    ventaHuevo,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const {
    vendedor,
    fecha_solicitud,
    cliente,
    observacion,
    productos,
    arrayPagos = [],
  } = req.body;

  // Cálculos optimizados usando métodos más eficientes
  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + Number(producto.total),
    0
  );

  const pagado = arrayPagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

  const transaction = await db.transaction();

  try {
    // Validación y preparación en un solo paso
    const huevoIds = productos.map((producto) => producto.productoId);

    // Búsqueda optimizada de productos
    const huevos = await Huevos.findAll({
      where: { id: huevoIds },
      attributes: ['id', 'stock', 'nombre_producto'],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // Mapa de productos para acceso rápido
    const huevoMap = new Map(huevos.map((h) => [h.id, h]));

    // Validación de stock en un solo recorrido
    const stockValidation = productos.map((producto) => {
      const huevo = huevoMap.get(Number(producto.productoId));

      if (!huevo) {
        throw new AppError(`El producto no existe`, 404);
      }

      const stock = parseFloat(huevo.stock);
      const cantidad = parseFloat(producto.cantidad);

      if (stock < cantidad) {
        throw new AppError(
          `Stock insuficiente para el producto ${huevo.nombre_producto}. Stock actual: ${stock}, Cantidad solicitada: ${cantidad}`,
          400
        );
      }

      return { huevo, producto };
    });

    // Crear registro de venta
    const ventaHuevo = await VentasHuevos.create(
      {
        vendedor,
        fecha_solicitud,

        cliente,
        observacion,
        total: totalPrecioProductos,
        saldo: totalPrecioProductos - pagado,
        estado_pago:
          Math.abs(totalPrecioProductos - pagado) < 0.01
            ? 'CANCELADO'
            : 'PENDIENTE',
      },
      { transaction }
    );

    // Preparar y crear métodos de pago en paralelo
    const metodosPromises = arrayPagos.map(async (pago) => {
      const metodoPago = await MetodosPago.findOne({
        where: { id: pago.metodoPago },
        transaction,
      });

      return {
        venta_huevos_id: ventaHuevo.id,
        metodo_pago_id: metodoPago.id,
        operacion: pago.operacion,
        monto: pago.monto,
        fecha: pago.fecha,
      };
    });

    const pagosData = await Promise.all(metodosPromises);
    await PagosVentaHuevos.bulkCreate(pagosData, { transaction });

    // Crear registros de productos vendidos
    const productosVentaData = stockValidation.map(({ producto }) => ({
      venta_huevos_id: ventaHuevo.id,
      huevo_id: producto.productoId,
      cantidad: producto.cantidad,
      precio_unitario: producto.precio_sin_igv,
      total: producto.total,
      paquetes: producto.paquetes,
    }));

    await ProductosVentaHuevos.bulkCreate(productosVentaData, { transaction });

    // Actualización de stock optimizada
    await Promise.all(
      stockValidation.map(async ({ huevo, producto }) => {
        await huevo.decrement('stock', {
          by: producto.cantidad,
          transaction,
        });
      })
    );

    // Confirmar transacción
    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: 'La cotización se agregó correctamente!',
      ventaHuevo,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

export const update = catchAsync(async (req, res, next) => {
  const { ventaHuevo } = req;

  const {
    vendedor,
    fecha_solicitud,

    cliente,
    observacion,
    productos,
    arrayPagos = [],
  } = req.body;

  // Cálculos optimizados usando métodos más eficientes
  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + Number(producto.total),
    0
  );

  const pagado = arrayPagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

  const transaction = await db.transaction();

  try {
    // Crear registro de venta
    await ventaHuevo.update(
      {
        vendedor,
        fecha_solicitud,

        cliente,
        observacion,
        total: totalPrecioProductos,
        saldo: totalPrecioProductos - pagado,
        estado_pago:
          Math.abs(totalPrecioProductos - pagado) < 0.01
            ? 'CANCELADO'
            : 'PENDIENTE',
      },
      { transaction }
    );

    await PagosVentaHuevos.destroy({
      where: { venta_huevos_id: ventaHuevo.id },
      transaction,
    });

    // Preparar y crear métodos de pago en paralelo
    const metodosPromises = arrayPagos.map(async (pago) => {
      const metodoPago = await MetodosPago.findOne({
        where: { id: pago.metodoPago },
        transaction,
      });

      return {
        venta_huevos_id: ventaHuevo.id,
        metodo_pago_id: metodoPago.id,
        operacion: pago.operacion,
        monto: pago.monto,
        fecha: pago.fecha,
      };
    });

    const pagosData = await Promise.all(metodosPromises);
    await PagosVentaHuevos.bulkCreate(pagosData, { transaction });

    // Confirmar transacción
    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: 'La cotización se agregó correctamente!',
      ventaHuevo,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

export const deleteElement = catchAsync(async (req, res) => {
  const { ventaHuevo } = req;

  await Promise.all(
    ventaHuevo.productos.map((producto) =>
      Huevos.update(
        { stock: Number(producto.huevo.stock) + Number(producto.cantidad) },
        { where: { id: producto.huevo.id } }
      )
    )
  );

  // Actualizar el estado de la venta
  await ventaHuevo.update({ estado: 'ANULADO' });

  return res.status(200).json({
    status: 'success',
    message: `La venta de huevo con id: ${ventaHuevo.id} ha sido anulada correctamente`,
    data: ventaHuevo,
  });
});
