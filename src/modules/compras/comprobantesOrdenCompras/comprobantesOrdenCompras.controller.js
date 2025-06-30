import { Op } from 'sequelize';
import { db } from '../../../db/db.config.js';
import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosPago } from '../../ajustes/metodosPagos/metodosPago.model.js';
import { Clientes } from '../../clientesProveedores/clientes/clientes.model.js';
import { Proveedores } from '../../clientesProveedores/proveedores/proveedores.model.js';
import { MisProductos } from '../../productos/misProductos/misProductos.model.js';
import { PagosComprobanteOrdenCompras } from '../pagosComprobanteOrdenCompras/pagosComprobanteOrdenCompras.model.js';
import { PagosOrdenCompras } from '../pagosOrdenCompras/pagosOrdenCompras.model.js';
import { ProductosComprobanteOrdenCompras } from '../productosComprobanteOrdenCompras/productosComprobanteOrdenCompras.model.js';
import { ProductosOrdenCompras } from '../productosOrdenCompras/productosOrdenCompras.model.js';
import { ComprobantesOrdenCompras } from './comprobantesOrdenCompras.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const comprobantesOrdenCompras = await ComprobantesOrdenCompras.findAll({
    include: [
      {
        model: Proveedores,
        as: 'proveedor',
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    status: 'Success',
    results: comprobantesOrdenCompras.length,
    comprobantesOrdenCompras,
  });
});

export const findAllTotal = catchAsync(async (req, res, next) => {
  const fechaInicio = new Date(new Date().getFullYear(), 0, 1);
  const fechaFin = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59); // 31 de diciembre del año actual

  const { count: totalComprobantes, rows: comprobantes } =
    await ComprobantesOrdenCompras.findAndCountAll({
      where: {
        fechaEmision: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      attributes: ['saldoInicial'],
    });

  const totalSaldo = comprobantes.reduce((sum, comprobante) => {
    const saldo = parseFloat(comprobante.saldoInicial) || 0;
    return sum + saldo;
  }, 0);

  return res.status(200).json({
    status: 'Success',
    results: {
      totalComprobantes,
      totalSaldo: totalSaldo.toFixed(2),
    },
  });
});

export const findAllProducto = catchAsync(async (req, res, next) => {
  const comprobantesOrdenCompras = await ComprobantesOrdenCompras.findAll({
    include: [
      {
        model: Clientes,
        as: 'cliente',
      },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: comprobantesOrdenCompras.length,
    comprobantesOrdenCompras,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { comprobanteOrdenCompra } = req;

  return res.status(200).json({
    status: 'Success',
    comprobanteOrdenCompra,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { ordenCompra } = req;
  const {
    proveedorId,
    usuarioId,
    autorizado,
    comprador,
    serie,
    fechaEmision,
    fechaVencimiento,
    tipoComprobante,
    moneda,
    tipoCambio,
    observacion,
    productos,
    arrayPagos,
  } = req.body;

  if (ordenCompra.comprobanteOrdenCompraId) {
    return next(
      new AppError(
        `Ya se genero  un comprobante para esta orden de compra`,
        404
      )
    );
  }

  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + Number(producto.total),
    0
  );

  const pagado = arrayPagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

  const transaction = await db.transaction();

  try {
    const comprobanteOrdenCompra = await ComprobantesOrdenCompras.create(
      {
        proveedorId,
        usuarioId,
        autorizado,
        comprador,
        serie,
        fechaEmision,
        fechaVencimiento,
        tipoComprobante,
        moneda,
        tipoCambio,
        observacion,
        saldoInicial: totalPrecioProductos,
        saldo: Number((totalPrecioProductos - pagado).toFixed(2)),
        estadoPago:
          Math.abs(totalPrecioProductos - pagado) < 0.01
            ? 'CANCELADO'
            : 'PENDIENTE',
      },
      { transaction }
    );
    for (const pago of arrayPagos) {
      const metodoPago = await MetodosPago.findOne({
        Where: { id: pago.metodoPago },
      });

      await PagosComprobanteOrdenCompras.create(
        {
          comprobanteOrdenCompraId: comprobanteOrdenCompra.id,
          metodoPago: metodoPago,
          operacion: pago.operacion,
          monto: pago.monto,
          fecha: pago.fecha,
        },
        { transaction }
      );
    }

    for (const producto of productos) {
      const miProducto = await MisProductos.findOne({
        where: { id: producto.productoId },
        attributes: ['id', 'stock', 'nombre', 'codUnidad', 'conStock'],
        lock: true, // Bloquear el registro durante la transacción
        transaction,
      });

      if (!miProducto) {
        throw new AppError(
          `Producto con ID ${producto.productoId} no encontrado`,
          404
        );
      }

      await ProductosComprobanteOrdenCompras.create(
        {
          comprobanteOrdenCompraId: comprobanteOrdenCompra.id,
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioUnitario,
          total: producto.total,
          stock: producto.cantidad,
        },
        { transaction }
      );

      if (miProducto.conStock) {
        await miProducto.update(
          { stock: Number(miProducto.stock) + Number(producto.cantidad) },
          { transaction }
        );
      }
    }

    await ordenCompra.update(
      { comprobanteOrdenCompraId: comprobanteOrdenCompra.id },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: '¡La orden de compra se agregó correctamente!',
      comprobanteOrdenCompra,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    next(error);
  }
});

export const update = catchAsync(async (req, res) => {
  const { comprobanteOrdenCompra } = req;
  const {
    proveedorId,
    usuarioId,
    autorizado,
    comprador,
    fechaEmision,
    fechaVencimiento,
    moneda,
    tipoOrdenCompra,
    tipoCambio,
    observacion,
    serie,
    // arrayPagos,
    // productos,
  } = req.body;

  // const totalPrecioProductos = productos.reduce(
  //   (sum, producto) => sum + Number(producto.total),
  //   0
  // );

  // const pagado = arrayPagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

  const transaction = await db.transaction();

  try {
    await comprobanteOrdenCompra.update(
      {
        proveedorId,
        usuarioId,
        autorizado,
        comprador,
        fechaEmision,
        fechaVencimiento,
        moneda,
        tipoOrdenCompra,
        tipoCambio,
        observacion,
        serie,
        // saldoInicial: totalPrecioProductos,
        // saldo: totalPrecioProductos - pagado,
        // estadoPago:
        //   Math.abs(totalPrecioProductos - pagado) < 0.01
        //     ? 'CANCELADO'
        //     : 'PENDIENTE',
      },
      { transaction }
    );

    // await PagosOrdenCompras.destroy({
    //   where: { cotizacionId: cotizacion.id },
    //   transaction,
    // });
    // await ProductosOrdenCompras.destroy({
    //   where: { cotizacionId: cotizacion.id },
    //   transaction,
    // });

    // for (const pago of arrayPagos) {
    //   const metodoPago = await MetodosPago.findOne({
    //     Where: { id: pago.metodoPago },
    //   });

    //   const banco = await CuentasBancarias.findOne({
    //     Where: { id: pago.banco },
    //   });
    //   await PagosOrdenCompras.create(
    //     {
    //       ordenCompraId: ordenCompra.id,
    //       metodoPago: metodoPago,
    //       banco: banco,
    //       operacion: pago.operacion,
    //       monto: pago.monto,
    //       fecha: pago.fecha,
    //     },
    //     { transaction }
    //   );
    // }

    // for (const producto of productos) {
    //   await ProductosOrdenCompras.create(
    //     {
    //       ordenCompraId: ordenCompra.id,
    //       productoId: producto.productoId,
    //       cantidad: producto.cantidad,
    //       precioUnitario: producto.precioUnitario,
    //       total: producto.total,
    //       stock: producto.cantidad,
    //     },
    //     { transaction }
    //   );
    // }

    // Confirmar la transacción
    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: '¡La orden de compra se agregó correctamente!',
      comprobanteOrdenCompra,
    });
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    next(error);
  }
});

export const deleteElement = catchAsync(async (req, res) => {
  const { comprobanteOrdenCompra } = req;

  if (!comprobanteOrdenCompra) {
    throw new AppError('Comprobante de orden de compra no encontrado', 404);
  }

  const transaction = await db.transaction();

  try {
    const productos = await ProductosComprobanteOrdenCompras.findAll({
      where: { comprobanteOrdenCompraId: comprobanteOrdenCompra.id },
    });

    for (const producto of productos) {
      const miProducto = await MisProductos.findOne({
        where: { id: producto.productoId },
      });

      if (!miProducto) {
        throw new AppError(
          `Producto no encontrado: ${producto.productoId}`,
          404
        );
      }

      if (Number(miProducto.stock) < Number(producto.cantidad)) {
        throw new AppError(
          `Stock insuficiente para anular el comprobante. Producto: ${miProducto.nombre}. Stock actual: ${miProducto.stock}, Cantidad solicitada: ${producto.cantidad}`,
          400
        );
      }

      await miProducto.update(
        { stock: Number(miProducto.stock) - Number(producto.cantidad) },
        { transaction }
      );
    }

    await comprobanteOrdenCompra.update({ status: 'Anulado' }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      status: 'success',
      message: `El comprobante de orden de compra con ID: ${comprobanteOrdenCompra.id} ha sido anulado`,
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});
