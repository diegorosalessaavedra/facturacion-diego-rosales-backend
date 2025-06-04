import { db } from '../../../db/db.config.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosPago } from '../../ajustes/metodosPagos/metodosPago.model.js';
import { MisProductos } from '../../productos/misProductos/misProductos.model.js';
import { PagosCotizaciones } from '../pagosCotizaciones/pagosCotizaciones.model.js';
import { ProductoCotizaciones } from '../productoCotizaciones/productoCotizaciones.model.js';
import { Cotizaciones } from './cotizaciones.model.js';
import { Clientes } from '../../clientesProveedores/clientes/clientes.model.js';
import { Op } from 'sequelize';
import { ComprobantesElectronicos } from '../../comprobantes/filesComprobanteElectronicos/comprobantesElectronicos/comprobantesElectronicos.model.js';
import { NotasComprobante } from '../../comprobantes/filesNotasComprobante/notasComprobante/notasComprobante.model.js';

export const findAllTotal = catchAsync(async (req, res, next) => {
  const fechaInicio = new Date(new Date().getFullYear(), 0, 1); // 1 de enero del año actual
  const fechaFin = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59); // 31 de diciembre del año actual

  // Obtener todas las cotizaciones dentro del rango de fechas
  const { count: totalCotizaciones, rows: cotizaciones } =
    await Cotizaciones.findAndCountAll({
      where: {
        status: 'Activo',
        fechaEmision: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      attributes: ['saldoInicial', 'saldo', 'comprobanteElectronicoId'], // Seleccionar solo campos necesarios
    });

  // Calcular el saldo total
  const totalSaldo = cotizaciones.reduce((sum, cotizacion) => {
    const saldo = parseFloat(cotizacion.saldoInicial) || 0;
    return sum + saldo;
  }, 0);

  const totalSaldoPendiente = cotizaciones.reduce((sum, cotizacion) => {
    const saldo = parseFloat(cotizacion.saldo) || 0;
    return sum + saldo;
  }, 0);

  // Separar cotizaciones con y sin comprobantes
  const cotizacionesComprobantes = cotizaciones.filter(
    (cotizacion) => cotizacion.comprobanteElectronicoId !== null
  );

  return res.status(200).json({
    status: 'Success',
    results: {
      totalCotizaciones,
      totalSaldo: totalSaldo.toFixed(2),
      totalSaldoPendiente: totalSaldoPendiente.toFixed(2),
      cotizacionesConComprobantes: cotizacionesComprobantes.length,
    },
  });
});

export const findAll = catchAsync(async (req, res, next) => {
  const { tipoFiltro, dataFiltro, fechaInicial, fechaFinal } = req.query;

  let whereCliente = {};
  let whereCotizacion = {};

  if (tipoFiltro && tipoFiltro === 'vendedor' && dataFiltro.length > 1) {
    whereCotizacion.vendedor = { [Op.iLike]: `%${dataFiltro}%` };
  }

  if (tipoFiltro && tipoFiltro === 'cliente' && dataFiltro.length > 1) {
    whereCliente = {
      [Op.or]: [
        { nombreApellidos: { [Op.iLike]: `%${dataFiltro}%` } },
        { nombreComercial: { [Op.iLike]: `%${dataFiltro}%` } },
        { numeroDoc: { [Op.iLike]: `%${dataFiltro}%` } },
      ],
    };
  }

  if (tipoFiltro && tipoFiltro === 'fechaEmision') {
    whereCotizacion.fechaEmision = {
      [Op.between]: [fechaInicial, fechaFinal],
    };
  }
  if (tipoFiltro && tipoFiltro === 'fechaEntrega') {
    whereCotizacion.fechaEntrega = {
      [Op.between]: [fechaInicial, fechaFinal],
    };
  }

  const cotizaciones = await Cotizaciones.findAll({
    where: whereCotizacion,
    include: [
      {
        model: Clientes,
        as: 'cliente',
        where: whereCliente,
      },
      {
        model: ProductoCotizaciones,
        as: 'productos',
        include: { model: MisProductos, as: 'producto' },
      },
      {
        model: PagosCotizaciones,
        as: 'pagos',
      },
      {
        model: ComprobantesElectronicos,
        as: 'ComprobanteElectronico',
        include: [
          {
            model: NotasComprobante,
          },
        ],
      },
    ],
    order: [
      ['fechaEmision', 'DESC'],
      ['id', 'DESC'],
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: cotizaciones.length,
    cotizaciones,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { cotizacion } = req;

  return res.status(200).json({
    status: 'Success',
    cotizacion,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const {
    tipoEnvio,
    tipoCotizacion,
    fecEmision,
    fecEntrega,
    direccionEnvio,
    moneda,
    tipoCambio,
    consignatario,
    consignatarioDni,
    consignatarioTelefono,
    informacionReferencial,
    observacion,
    consignatario2,
    consignatarioDni2,
    consignatarioTelefono2,
    informacionReferencial2,
    observacion2,
    clienteId,
    usuarioId,
    vendedor,
    arrayPagos,
    productos,
  } = req.body;

  const totalPrecioProductos = productos.reduce(
    (sum, producto) => sum + Number(producto.total),
    0
  );

  const pagado = arrayPagos?.reduce((sum, pago) => sum + Number(pago.monto), 0);

  const transaction = await db.transaction();

  try {
    const cotizacion = await Cotizaciones.create(
      {
        clienteId,
        usuarioId,
        vendedor,
        tipoEnvio,
        tipoCotizacion,
        fechaEmision: fecEmision,
        fechaEntrega: fecEntrega,
        direccionEnvio,
        moneda,
        tipoCambio,
        consignatario,
        consignatarioDni,
        consignatarioTelefono,
        informacionReferencial,
        observacion,
        consignatario2,
        consignatarioDni2,
        consignatarioTelefono2,
        informacionReferencial2,
        observacion2,
        saldoInicial: totalPrecioProductos,
        saldo: Number(totalPrecioProductos) - Number(pagado),
        estadoPago:
          Math.abs(Number(totalPrecioProductos) - Number(pagado)) < 0.01
            ? 'CANCELADO'
            : 'PENDIENTE',
      },
      { transaction }
    );

    for (const pago of arrayPagos) {
      const metodoPago = await MetodosPago.findOne({
        Where: { id: pago.metodoPago },
      });

      await PagosCotizaciones.create(
        {
          cotizacionId: cotizacion.id,
          metodoPago: metodoPago,
          operacion: pago.operacion,
          monto: pago.monto,
          fecha: pago.fecha,
        },
        { transaction }
      );
    }

    for (const producto of productos) {
      await ProductoCotizaciones.create(
        {
          cotizacionId: cotizacion.id,
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioUnitario,
          total: producto.total,
        },
        { transaction }
      );
    }

    // Confirma la transacción si todo fue bien
    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: 'La cotización se agregó correctamente!',
      cotizacion,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    next(error);
  }
});

export const update = catchAsync(async (req, res, next) => {
  const { cotizacion } = req;
  const {
    tipoEnvio,
    fecEmision,
    fecEntrega,
    direccionEnvio,
    moneda,
    tipoCambio,
    tipoCotizacion,
    consignatario,
    consignatarioDni,
    consignatarioTelefono,
    informacionReferencial,
    observacion,
    consignatario2,
    consignatarioDni2,
    consignatarioTelefono2,
    informacionReferencial2,
    observacion2,
    clienteId,
    usuarioId,
    vendedor,
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
    await cotizacion.update(
      {
        clienteId,
        usuarioId,
        vendedor,
        tipoEnvio,
        fechaEmision: fecEmision,
        fechaEntrega: fecEntrega,
        direccionEnvio,
        moneda,
        tipoCambio,
        tipoCotizacion,
        consignatario,
        consignatarioDni,
        consignatarioTelefono,
        informacionReferencial,
        observacion,
        consignatario2,
        consignatarioDni2,
        consignatarioTelefono2,
        informacionReferencial2,
        observacion2,
        saldoInicial: totalPrecioProductos,
        saldo: totalPrecioProductos - pagado,
        estadoPago:
          Math.abs(totalPrecioProductos - pagado) < 0.01
            ? 'CANCELADO'
            : 'PENDIENTE',
      },
      { transaction }
    );

    await PagosCotizaciones.destroy({
      where: { cotizacionId: cotizacion.id },
      transaction,
    });
    await ProductoCotizaciones.destroy({
      where: { cotizacionId: cotizacion.id },
      transaction,
    });

    for (const pago of arrayPagos) {
      const metodoPago = await MetodosPago.findOne({
        where: { id: pago.metodoPago },
        transaction,
      });

      await PagosCotizaciones.create(
        {
          cotizacionId: cotizacion.id,
          metodoPago: metodoPago,
          operacion: pago.operacion,
          monto: pago.monto,
          fecha: pago.fecha,
        },
        { transaction }
      );
    }

    for (const producto of productos) {
      await ProductoCotizaciones.create(
        {
          cotizacionId: cotizacion.id,
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioUnitario,
          total: producto.total,
        },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: 'La cotización se actualizó correctamente!',
      cotizacion,
    });
  } catch (error) {
    // Rollback en caso de error
    await transaction.rollback();
    console.error(error);
    next(error);
  }
});

export const deleteElement = catchAsync(async (req, res) => {
  const { cotizacion } = req;

  await cotizacion.update({ status: 'Anulado' });

  return res.status(200).json({
    status: 'success',
    message: `The cotizacion with id: ${cotizacion.id} has been deleted`,
  });
});
