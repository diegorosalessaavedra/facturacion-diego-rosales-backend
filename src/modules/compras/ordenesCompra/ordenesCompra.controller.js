import { Op } from 'sequelize';
import { db } from '../../../db/db.config.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosPago } from '../../ajustes/metodosPagos/metodosPago.model.js';
import { Clientes } from '../../clientesProveedores/clientes/clientes.model.js';
import { Proveedores } from '../../clientesProveedores/proveedores/proveedores.model.js';
import { User } from '../../user/user.model.js';
import { ComprobantesOrdenCompras } from '../comprobantesOrdenCompras/comprobantesOrdenCompras.model.js';
import { PagosOrdenCompras } from '../pagosOrdenCompras/pagosOrdenCompras.model.js';
import { ProductosOrdenCompras } from '../productosOrdenCompras/productosOrdenCompras.model.js';
import { OrdenesCompra } from './ordenesCompra.model.js';
import { MisProductos } from '../../productos/misProductos/misProductos.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { tipoFiltro, dataFiltro, fechaInicial, fechaFinal } = req.query;

  let whereVendedor = {};
  let whereProveedor = {};
  let whereFechas = {};

  if (tipoFiltro && tipoFiltro === 'vendedor' && dataFiltro.length > 1) {
    whereVendedor.nombre = { [Op.iLike]: `%${dataFiltro}%` };
  }

  if (tipoFiltro && tipoFiltro === 'proveedor' && dataFiltro.length > 1) {
    whereProveedor = {
      [Op.or]: [
        { nombreApellidos: { [Op.iLike]: `%${dataFiltro}%` } },
        { nombreComercial: { [Op.iLike]: `%${dataFiltro}%` } },
        { numeroDoc: { [Op.iLike]: `%${dataFiltro}%` } },
      ],
    };
  }

  if (tipoFiltro && tipoFiltro === 'fechaEmision') {
    whereFechas.fechaEmision = {
      [Op.between]: [fechaInicial, fechaFinal],
    };
  }
  if (tipoFiltro && tipoFiltro === 'fechaVencimiento') {
    whereFechas.fechaVencimiento = {
      [Op.between]: [fechaInicial, fechaFinal],
    };
  }

  const ordenesCompras = await OrdenesCompra.findAll({
    where: whereFechas,

    include: [
      {
        model: Proveedores,
        as: 'proveedor',
        where: whereProveedor,
      },
      {
        model: ComprobantesOrdenCompras,
        as: 'comprobante',
      },
      {
        model: ProductosOrdenCompras,
        as: 'productos',
        include: { model: MisProductos, as: 'producto' },
      },
      {
        model: PagosOrdenCompras,
        as: 'pagos',
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    status: 'Success',
    results: ordenesCompras.length,
    ordenesCompras,
  });
});

export const findAllProducto = catchAsync(async (req, res, next) => {
  const ordenesCompras = await OrdenesCompra.findAll({
    include: [
      {
        model: User,
        as: 'aprobado',
      },
      {
        model: Clientes,
        as: 'cliente',
      },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: ordenesCompras.length,
    ordenesCompras,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { ordenCompra } = req;

  return res.status(200).json({
    status: 'Success',
    ordenCompra,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const {
    proveedorId,
    usuarioId,
    autorizado,
    comprador,
    fechaEmision,
    fechaVencimiento,
    moneda,
    tipoOrdenCompra,
    formaPago,
    tipoCambio,
    observacion,
    productos,
    arrayPagos,
  } = req.body;

  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + Number(producto.total),
    0
  );

  const pagado = arrayPagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

  const transaction = await db.transaction();

  try {
    const ordenCompra = await OrdenesCompra.create(
      {
        proveedorId,
        usuarioId,
        autorizado,
        comprador,
        fechaEmision,
        fechaVencimiento,
        moneda,
        tipoOrdenCompra,
        formaPago,
        tipoCambio,
        observacion,
        saldoInicial: totalPrecioProductos,
        saldo: totalPrecioProductos - pagado,
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

      await PagosOrdenCompras.create(
        {
          ordenCompraId: ordenCompra.id,
          metodoPago: metodoPago,
          operacion: pago.operacion,
          monto: pago.monto,
          fecha: pago.fecha,
        },
        { transaction }
      );
    }

    for (const producto of productos) {
      await ProductosOrdenCompras.create(
        {
          ordenCompraId: ordenCompra.id,
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioUnitario,
          total: producto.total,
          stock: producto.cantidad,
        },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: '¡La orden de compra se agregó correctamente!',
      ordenCompra,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    next(error);
  }
});

export const update = catchAsync(async (req, res, next) => {
  const { ordenCompra } = req;
  const {
    proveedorId,
    usuarioId,
    autorizado,
    comprador,
    fechaEmision,
    fechaVencimiento,
    moneda,
    tipoOrdenCompra,
    formaPago,
    tipoCambio,
    observacion,
    arrayPagos,
    productos,
  } = req.body;

  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + Number(producto.total),
    0
  );

  const pagado = arrayPagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

  const transaction = await db.transaction();

  try {
    await ordenCompra.update(
      {
        proveedorId,
        usuarioId,
        autorizado,
        comprador,
        fechaEmision,
        fechaVencimiento,
        moneda,
        tipoOrdenCompra,
        formaPago,
        tipoCambio,
        observacion,
        saldoInicial: totalPrecioProductos,
        saldo: totalPrecioProductos - pagado,
        estadoPago:
          Math.abs(totalPrecioProductos - pagado) < 0.01
            ? 'CANCELADO'
            : 'PENDIENTE',
      },
      { transaction }
    );

    await PagosOrdenCompras.destroy({
      where: { ordenCompraId: ordenCompra.id },
      transaction,
    });
    await ProductosOrdenCompras.destroy({
      where: { ordenCompraId: ordenCompra.id },
      transaction,
    });

    for (const pago of arrayPagos) {
      const metodoPago = await MetodosPago.findOne({
        Where: { id: pago.metodoPago },
      });

      await PagosOrdenCompras.create(
        {
          ordenCompraId: ordenCompra.id,
          metodoPago: metodoPago,
          operacion: pago.operacion,
          monto: pago.monto,
          fecha: pago.fecha,
        },
        { transaction }
      );
    }

    for (const producto of productos) {
      await ProductosOrdenCompras.create(
        {
          ordenCompraId: ordenCompra.id,
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioUnitario,
          total: producto.total,
          stock: producto.cantidad,
        },
        { transaction }
      );
    }

    // Confirmar la transacción
    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: '¡La orden de compra se agregó correctamente!',
      ordenCompra,
    });
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    console.error(error);
    next(error);
  }
});

export const deleteElement = catchAsync(async (req, res) => {
  const { ordenCompra } = req;

  await ordenCompra.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The ordenCompra with id: ${ordenCompra.id} has been deleted`,
  });
});
