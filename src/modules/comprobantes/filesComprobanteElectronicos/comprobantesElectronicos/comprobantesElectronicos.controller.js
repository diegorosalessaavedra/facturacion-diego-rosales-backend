import axios from 'axios';
import { db } from '../../../../db/db.config.js';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { numeroALetras } from '../../../../utils/numeroLetras.js';
import { Clientes } from '../../../clientesProveedores/clientes/clientes.model.js';
import { PagosComprobantesElectronicos } from '../pagosComprobantesElectronicos/pagosComprobantesElectronicos.model.js';
import { ProductosComprobanteElectronico } from '../productosComprobanteElectronico/productosComprobanteElectronico.model.js';
import {
  calculateTotals,
  extractDigestValue,
  formatWithLeadingZeros,
  generateQRContent,
  getComprobanteConfig,
  validateCreateRequest,
} from '../../../../utils/functionsComprobante.js';
import { AppError } from '../../../../utils/AppError.js';
import { MetodosPago } from '../../../ajustes/metodosPagos/metodosPago.model.js';
import { Cotizaciones } from '../../../ventas/cotizaciones/cotizaciones.model.js';
import { Op } from 'sequelize';
import { MisProductos } from '../../../productos/misProductos/misProductos.model.js';
import { NotasComprobante } from '../../filesNotasComprobante/notasComprobante/notasComprobante.model.js';
import { ComprobantesElectronicos } from './comprobantesElectronicos.model.js';
import { ComprobanteSujetaDetraccion } from '../comprobanteSujetaDetraccion/comprobanteSujetaDetraccion.model.js';

export const findAllTotal = catchAsync(async (req, res, next) => {
  try {
    const fechaInicio = new Date(new Date().getFullYear(), 0, 1);
    const fechaFin = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);
    const sequelize = db;

    // Consulta para obtener los comprobantes por mes
    const comprobantesPorMes = await ComprobantesElectronicos.findAll({
      where: {
        fechaEmision: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      attributes: [
        [
          sequelize.literal(
            `EXTRACT(MONTH FROM CAST("fechaEmision" AS TIMESTAMP))`
          ),
          'mes',
        ],
        [
          sequelize.literal(
            `EXTRACT(YEAR FROM CAST("fechaEmision" AS TIMESTAMP))`
          ),
          'anio',
        ],
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidadComprobantes'],
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'totalVenta'],
      ],
      group: [
        sequelize.literal(
          `EXTRACT(MONTH FROM CAST("fechaEmision" AS TIMESTAMP))`
        ),
        sequelize.literal(
          `EXTRACT(YEAR FROM CAST("fechaEmision" AS TIMESTAMP))`
        ),
      ],
      order: [
        sequelize.literal(
          `EXTRACT(MONTH FROM CAST("fechaEmision" AS TIMESTAMP)) ASC`
        ),
      ],
    });

    // Consulta para obtener el total de comprobantes y ventas del año
    const totalAnio = await ComprobantesElectronicos.findOne({
      where: {
        fechaEmision: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalComprobantes'],
        [sequelize.fn('SUM', sequelize.col('total_venta')), 'totalVentaAnio'],
      ],
    });

    // Prepara los resultados por mes
    const resultados = comprobantesPorMes.map((comprobante) => ({
      mes: comprobante.dataValues.mes,
      anio: comprobante.dataValues.anio,
      cantidadComprobantes: parseInt(
        comprobante.dataValues.cantidadComprobantes,
        10
      ),
      totalVenta: parseFloat(comprobante.dataValues.totalVenta).toFixed(2),
    }));

    // Prepara los totales anuales
    const totalVentaAnio = totalAnio
      ? parseFloat(totalAnio.dataValues.totalVentaAnio).toFixed(2)
      : '0.00';
    const totalComprobantesAnio = totalAnio
      ? parseInt(totalAnio.dataValues.totalComprobantes, 10)
      : 0;

    // Responde con los datos incluyendo el total anual
    return res.status(200).json({
      status: 'Success',
      results: resultados,
      totalAnio: {
        totalComprobantes: totalComprobantesAnio,
        totalVenta: totalVentaAnio,
      },
    });
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    return res.status(500).json({
      status: 'Error',
      message: error.message,
    });
  }
});

export const findAll = catchAsync(async (req, res, next) => {
  const { tipoFiltro, dataFiltro, fechaInicial, fechaFinal } = req.query;

  let whereCliente = {};
  let whereCotizacion = {};

  if (tipoFiltro && tipoFiltro === 'vendedor' && dataFiltro.length > 1) {
    whereCotizacion.vendedor = { [Op.iLike]: `%${dataFiltro}%` };
  }

  if (tipoFiltro && tipoFiltro === 'fechaEmision') {
    whereCotizacion.fechaEmision = {
      [Op.between]: [fechaInicial, fechaFinal],
    };
  }
  if (tipoFiltro && tipoFiltro === 'fechaVencimiento') {
    whereCotizacion.fechaVencimiento = {
      [Op.between]: [fechaInicial, fechaFinal],
    };
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

  const comprobantes = await ComprobantesElectronicos.findAll({
    where: whereCotizacion,

    include: [
      { model: Clientes, as: 'cliente', where: whereCliente },
      { model: PagosComprobantesElectronicos, as: 'pagos' },
      { model: ProductosComprobanteElectronico, as: 'productos' },
      { model: Cotizaciones, as: 'cotizacion' },
      { model: NotasComprobante },
    ],
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    status: 'success',
    results: comprobantes.length,
    comprobantes,
  });
});

export const findAllCotizaciones = catchAsync(async (req, res, next) => {
  const { tipoFiltro, dataFiltro, fechaInicial, fechaFinal } = req.query;

  let whereCliente = {};
  let whereCotizacion = {};

  if (tipoFiltro && tipoFiltro === 'vendedor' && dataFiltro.length > 1) {
    whereCotizacion.vendedor = { [Op.iLike]: `%${dataFiltro}%` };
  }

  if (tipoFiltro && tipoFiltro === 'fechaEmision') {
    whereCotizacion.fechaEmision = {
      [Op.between]: [fechaInicial, fechaFinal],
    };
  }
  if (tipoFiltro && tipoFiltro === 'fechaVencimiento') {
    whereCotizacion.fechaVencimiento = {
      [Op.between]: [fechaInicial, fechaFinal],
    };
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
  const comprobantes = await ComprobantesElectronicos.findAll({
    where: whereCotizacion,

    include: [
      { model: Clientes, as: 'cliente', whereCliente },
      { model: PagosComprobantesElectronicos, as: 'pagos' },
      { model: ProductosComprobanteElectronico, as: 'productos' },
      {
        model: Cotizaciones,
        as: 'cotizacion',
        required: true,
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    status: 'success',
    results: comprobantes.length,
    comprobantes,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { comprobanteElectronico } = req;

  return res.status(200).json({
    status: 'success',
    comprobanteElectronico,
  });
});

export const create = catchAsync(async (req, res, next) => {
  validateCreateRequest(req.body);

  const {
    tipoComprobante,
    fecEmision,
    fecVencimiento,
    clienteId,
    usuarioId,
    vendedor,
    productos,
    arrayPagos,
    tipoOperacion,
    codBienDetraccion,
    codMedioPago,
    ctaBancaria,
    porcentaje,
    montoDetraccion,
    monto_pendiente,
    observacion,
  } = req.body;

  const cliente = await Clientes.findOne({
    where: { id: clienteId },
    rejectOnEmpty: true,
  });

  const { totalPrecioProductos, totalValorVenta, totalIgv } =
    calculateTotals(productos);
  const comprobanteConfig = await getComprobanteConfig(tipoComprobante);

  let comprobanteElectronico;
  const transaction = await db.transaction();

  try {
    // Create comprobante
    comprobanteElectronico = await ComprobantesElectronicos.create(
      {
        clienteId,
        usuarioId,
        vendedor,
        serie: comprobanteConfig.serie,
        numeroSerie: formatWithLeadingZeros(comprobanteConfig.numeroSerie, 8),
        tipoComprobante,
        fechaEmision: fecEmision,
        fechaVencimiento: fecVencimiento,
        total_valor_venta: totalValorVenta,
        total_igv: totalIgv,
        total_venta: totalPrecioProductos,
        tipoOperacion,
        legend: numeroALetras(totalPrecioProductos),
        monto_pendiente,
        estado: 'PENDIENTE',
        observacion,
      },
      { transaction }
    );

    if (tipoOperacion === 'OPERACIÓN SUJETA A DETRACCIÓN') {
      await ComprobanteSujetaDetraccion.create(
        {
          comprobanteElectronicoId: comprobanteElectronico.id,
          codBienDetraccion: codBienDetraccion,
          codMedioPago: codMedioPago,
          ctaBancaria: ctaBancaria,
          porcentaje: porcentaje,
          montoDetraccion: montoDetraccion,
        },
        { transaction }
      );
    }

    // Process payments
    for (const pago of arrayPagos) {
      const metodoPago = await MetodosPago.findOne({
        where: { id: pago.metodoPago },
        transaction,
      });

      if (!metodoPago) {
        throw new AppError('Método de pago no encontrado', 404);
      }

      await PagosComprobantesElectronicos.create(
        {
          comprobanteElectronicoId: comprobanteElectronico.id,
          metodoPago,
          operacion: pago.operacion,
          monto: pago.monto,
          fecha: pago.fecha,
        },
        { transaction }
      );
    }

    let productosConStock = [];

    for (const producto of productos) {
      const miProducto = await MisProductos.findOne({
        where: { id: producto.productoId },
        attributes: ['id', 'stock', 'nombre', 'codUnidad', 'conStock'],
        lock: true,
        transaction,
      });

      if (!miProducto) {
        throw new AppError(
          `Producto con ID ${producto.productoId} no encontrado`,
          404
        );
      }

      if (miProducto.conStock) {
        const stock = parseFloat(miProducto.stock);
        const cantidad = parseFloat(producto.cantidad);

        if (isNaN(stock) || isNaN(cantidad)) {
          throw new AppError(
            `Valores inválidos de stock o cantidad para el producto ${miProducto.nombre}`,
            400
          );
        }

        if (stock < cantidad) {
          throw new AppError(
            `Stock insuficiente para el producto ${miProducto.nombre}. Stock actual: ${stock}, Cantidad solicitada: ${cantidad}`,
            400
          );
        }
      }

      await ProductosComprobanteElectronico.create(
        {
          comprobanteElectronicoId: comprobanteElectronico.id,
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioUnitario,
          total: producto.total,
        },
        {
          transaction,
          validate: true,
        }
      );

      productosConStock.push({
        comprobanteElectronicoId: comprobanteElectronico.id,
        productoId: producto.productoId,
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario,
        total: producto.total,
      });
    }

    let facturaAceptada = false;

    if (comprobanteConfig.url) {
      const dataComprobante = {
        ...(tipoComprobante === 'FACTURA ELECTRÓNICA'
          ? {
              tipo_documento: '01',
              cliente_tipo_doc: '6',
              cliente_num_doc: cliente.numeroDoc,
              cliente_nombre: cliente.nombreComercial,
            }
          : {
              tipo_documento: '03',
              cliente_tipo_doc: '1',
              cliente_num_doc: cliente.numeroDoc,
              cliente_nombre: cliente.nombreApellidos,
            }),
        ...(tipoOperacion === 'VENTA INTERNA'
          ? {
              tipo_operacion: '0101',
            }
          : {
              tipo_operacion: '1001',
              codBienDetraccion,
              codMedioPago,
              ctaBancaria,
              porcentaje,
              montoDetraccion,
            }),
        serie: comprobanteConfig.serie,
        correlativo: formatWithLeadingZeros(comprobanteConfig.numeroSerie, 8),
        total_valor_venta: totalValorVenta,
        total_igv: totalIgv,
        fecha_emision: fecEmision,
        total_venta: totalPrecioProductos,
        legend: numeroALetras(totalPrecioProductos),
        productos: await Promise.all(
          productos.map(async (producto) => {
            const miProducto = await MisProductos.findOne({
              where: { id: producto.productoId },
            });

            if (!miProducto) {
              throw new AppError('Producto no encontrado', 404);
            }

            const precioUnitarioSinIGV = Number(producto.precioUnitario) / 1.18;
            const valorVenta = precioUnitarioSinIGV * Number(producto.cantidad);
            const igv = valorVenta * 0.18;

            return {
              codigo: miProducto.codigoSunat,
              cantidad: producto.cantidad,
              unidad: miProducto.codUnidad,
              precio_unitario: precioUnitarioSinIGV,
              descripcion: miProducto.nombre || 'Producto',
              valor_venta: valorVenta,
              igv: igv,
            };
          })
        ),
      };

      try {
        const response = await axios.post(
          comprobanteConfig.url,
          dataComprobante,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );

        if (response.data?.cdr?.estado !== 'ACEPTADA') {
          facturaAceptada = false;
        }

        facturaAceptada = true;
        // Si llegamos aquí, el comprobante fue aceptado
        const digestValue = extractDigestValue(response.data.xml);
        const qrContent = generateQRContent({
          emisorRuc: process.env.COMPANY_RUC,
          tipoComprobante: comprobanteConfig.type,
          serie: comprobanteConfig.serie,
          correlativo: formatWithLeadingZeros(comprobanteConfig.numeroSerie, 8),
          igv: totalIgv,
          total: totalPrecioProductos,
          fecha_emision: fecEmision,
          tipoDocCliente: tipoComprobante === 'FACTURA ELECTRÓNICA' ? '6' : '1',
          numeroDocCliente: cliente.numeroDoc,
          digestValue,
        });

        if (facturaAceptada) {
          for (const productoStock of productosConStock) {
            const miProducto = await MisProductos.findOne({
              where: { id: productoStock.productoId },
              attributes: ['id', 'stock', 'nombre', 'codUnidad', 'conStock'],
              lock: true,
              transaction,
            });

            if (miProducto.conStock) {
              await miProducto.update(
                {
                  stock:
                    Number(miProducto.stock) - Number(productoStock.cantidad),
                },
                {
                  transaction,
                  validate: true,
                }
              );
            }
          }
        }

        await comprobanteElectronico.update(
          {
            estado: 'ACEPTADA',
            urlXml: response.data.files?.xml,
            cdr: response.data.files?.cdr,
            digestValue,
            qrContent,
          },
          { transaction }
        );
      } catch (error) {
        console.error('Error en el servicio de comprobantes:', {
          message: error.message,
          response: error.response?.data,
          stack: error.stack,
        });

        await comprobanteElectronico.update(
          {
            estado: 'RECHAZADA',
            observaciones: `Error en servicio externo: ${
              error.response?.data?.mensaje ||
              error.message ||
              'Error desconocido'
            }`,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: 'Comprobante electrónico creado exitosamente',
      comprobanteElectronico,
    });
  } catch (error) {
    await transaction.rollback();

    console.error('Error en createCotizacion:', {
      error: error.message,
      stack: error.stack,
      clienteId: req.body.clienteId,
    });

    next(error);
  }
});

export const createCotizacion = catchAsync(async (req, res, next) => {
  validateCreateRequest(req.body);
  const { cotizacion } = req;

  const {
    tipoComprobante,
    fecEmision,
    fecVencimiento,
    clienteId,
    usuarioId,
    vendedor,
    productos,
    arrayPagos,
    tipoOperacion,
    codBienDetraccion,
    codMedioPago,
    ctaBancaria,
    porcentaje,
    montoDetraccion,
    monto_pendiente,
    observacion,
  } = req.body;

  if (cotizacion.comprobanteElectronicoId) {
    throw new AppError(
      'Esta cotización ya tiene un comprobante electrónico',
      400
    );
  }

  const cliente = await Clientes.findOne({
    where: { id: clienteId },
    rejectOnEmpty: true,
  });

  const { totalPrecioProductos, totalValorVenta, totalIgv } =
    calculateTotals(productos);
  const comprobanteConfig = await getComprobanteConfig(tipoComprobante);

  let comprobanteElectronico;
  const transaction = await db.transaction();

  try {
    // Create comprobante
    comprobanteElectronico = await ComprobantesElectronicos.create(
      {
        clienteId,
        usuarioId,
        vendedor,
        serie: comprobanteConfig.serie,
        numeroSerie: formatWithLeadingZeros(comprobanteConfig.numeroSerie, 8),
        tipoComprobante,
        fechaEmision: fecEmision,
        fechaVencimiento: fecVencimiento,
        total_valor_venta: totalValorVenta,
        total_igv: totalIgv,
        total_venta: totalPrecioProductos,
        tipoOperacion,
        legend: numeroALetras(totalPrecioProductos),
        monto_pendiente,
        observacion,
        estado: 'PENDIENTE',
      },
      { transaction }
    );

    if (tipoOperacion === 'OPERACIÓN SUJETA A DETRACCIÓN') {
      await ComprobanteSujetaDetraccion.create(
        {
          comprobanteElectronicoId: comprobanteElectronico.id,
          codBienDetraccion: codBienDetraccion,
          codMedioPago: codMedioPago,
          ctaBancaria: ctaBancaria,
          porcentaje: porcentaje,
          montoDetraccion: montoDetraccion,
        },
        { transaction }
      );
    }

    await cotizacion.update(
      {
        comprobanteElectronicoId: comprobanteElectronico.id,
      },
      { transaction }
    );

    // Process payments
    for (const pago of arrayPagos) {
      const metodoPago = await MetodosPago.findOne({
        where: { id: pago.metodoPago },
        transaction,
      });

      if (!metodoPago) {
        throw new AppError('Método de pago no encontrado', 404);
      }

      await PagosComprobantesElectronicos.create(
        {
          comprobanteElectronicoId: comprobanteElectronico.id,
          metodoPago,
          operacion: pago.operacion,
          monto: pago.monto,
          fecha: pago.fecha,
        },
        { transaction }
      );
    }

    let productosConStock = [];

    for (const producto of productos) {
      const miProducto = await MisProductos.findOne({
        where: { id: producto.productoId },
        attributes: ['id', 'stock', 'nombre', 'codUnidad', 'conStock'],
        lock: true,
        transaction,
      });

      if (!miProducto) {
        throw new AppError(
          `Producto con ID ${producto.productoId} no encontrado`,
          404
        );
      }

      if (miProducto.conStock) {
        const stock = parseFloat(miProducto.stock);
        const cantidad = parseFloat(producto.cantidad);

        if (isNaN(stock) || isNaN(cantidad)) {
          throw new AppError(
            `Valores inválidos de stock o cantidad para el producto ${miProducto.nombre}`,
            400
          );
        }

        if (stock < cantidad) {
          throw new AppError(
            `Stock insuficiente para el producto ${miProducto.nombre}. Stock actual: ${stock}, Cantidad solicitada: ${cantidad}`,
            400
          );
        }
      }

      await ProductosComprobanteElectronico.create(
        {
          comprobanteElectronicoId: comprobanteElectronico.id,
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioUnitario,
          total: producto.total,
        },
        {
          transaction,
          validate: true,
        }
      );

      productosConStock.push({
        comprobanteElectronicoId: comprobanteElectronico.id,
        productoId: producto.productoId,
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario,
        total: producto.total,
      });
    }

    let facturaAceptada = false;

    if (comprobanteConfig.url) {
      const dataComprobante = {
        ...(tipoComprobante === 'FACTURA ELECTRÓNICA'
          ? {
              tipo_documento: '01',
              cliente_tipo_doc: '6',
              cliente_num_doc: cliente.numeroDoc,
              cliente_nombre: cliente.nombreComercial,
            }
          : {
              tipo_documento: '03',
              cliente_tipo_doc: '1',
              cliente_num_doc: cliente.numeroDoc,
              cliente_nombre: cliente.nombreApellidos,
            }),
        ...(tipoOperacion === 'VENTA INTERNA'
          ? {
              tipo_operacion: '0101',
            }
          : {
              tipo_operacion: '1001',
              codBienDetraccion,
              codMedioPago,
              ctaBancaria,
              porcentaje,
              montoDetraccion,
            }),
        serie: comprobanteConfig.serie,
        correlativo: formatWithLeadingZeros(comprobanteConfig.numeroSerie, 8),
        total_valor_venta: totalValorVenta,
        total_igv: totalIgv,
        fecha_emision: fecEmision,
        total_venta: totalPrecioProductos,
        legend: numeroALetras(totalPrecioProductos),
        productos: await Promise.all(
          productos.map(async (producto) => {
            const miProducto = await MisProductos.findOne({
              where: { id: producto.productoId },
            });

            if (!miProducto) {
              throw new AppError('Producto no encontrado', 404);
            }

            const precioUnitarioSinIGV = Number(producto.precioUnitario) / 1.18;
            const valorVenta = precioUnitarioSinIGV * Number(producto.cantidad);
            const igv = valorVenta * 0.18;

            return {
              codigo: miProducto.codigoSunat,
              cantidad: producto.cantidad,
              unidad: miProducto.codUnidad,
              precio_unitario: precioUnitarioSinIGV,
              descripcion: miProducto.nombre || 'Producto',
              valor_venta: valorVenta,
              igv: igv,
            };
          })
        ),
      };

      try {
        const response = await axios.post(
          comprobanteConfig.url,
          dataComprobante,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );

        if (response.data?.cdr?.estado !== 'ACEPTADA') {
          facturaAceptada = false;
        }

        facturaAceptada = true;
        // Si llegamos aquí, el comprobante fue aceptado
        const digestValue = extractDigestValue(response.data.xml);
        const qrContent = generateQRContent({
          emisorRuc: process.env.COMPANY_RUC,
          tipoComprobante: comprobanteConfig.type,
          serie: comprobanteConfig.serie,
          correlativo: formatWithLeadingZeros(comprobanteConfig.numeroSerie, 8),
          igv: totalIgv,
          total: totalPrecioProductos,
          fecha_emision: fecEmision,
          tipoDocCliente: tipoComprobante === 'FACTURA ELECTRÓNICA' ? '6' : '1',
          numeroDocCliente: cliente.numeroDoc,
          digestValue,
        });

        if (facturaAceptada) {
          for (const productoStock of productosConStock) {
            const miProducto = await MisProductos.findOne({
              where: { id: productoStock.productoId },
              attributes: ['id', 'stock', 'nombre', 'codUnidad', 'conStock'],
              lock: true,
              transaction,
            });

            if (miProducto.conStock) {
              await miProducto.update(
                {
                  stock:
                    Number(miProducto.stock) - Number(productoStock.cantidad),
                },
                {
                  transaction,
                  validate: true,
                }
              );
            }
          }
        }

        // Actualizar con los datos de éxito
        await comprobanteElectronico.update(
          {
            estado: 'ACEPTADA',
            urlXml: response.data.files?.xml,
            cdr: response.data.files?.cdr,
            digestValue,
            qrContent,
          },
          { transaction }
        );
      } catch (error) {
        console.error('Error en el servicio de comprobantes:', {
          message: error.message,
          response: error.response?.data,
          stack: error.stack,
        });

        await comprobanteElectronico.update(
          {
            estado: 'RECHAZADA',
            observaciones: `Error en servicio externo: ${
              error.response?.data?.mensaje ||
              error.message ||
              'Error desconocido'
            }`,
          },
          { transaction }
        );
        await cotizacion.update(
          {
            comprobanteElectronicoId: null,
          },
          { transaction }
        );
      }
    } else {
      for (const productoStock of productosConStock) {
        const miProducto = await MisProductos.findOne({
          where: { id: productoStock.productoId },
          attributes: ['id', 'stock', 'nombre', 'codUnidad', 'conStock'],
          lock: true,
          transaction,
        });

        if (miProducto.conStock) {
          await miProducto.update(
            {
              stock: Number(miProducto.stock) - Number(productoStock.cantidad),
            },
            {
              transaction,
              validate: true,
            }
          );
        }
      }

      await comprobanteElectronico.update(
        {
          estado: 'ACEPTADA',
        },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: 'Comprobante electrónico creado exitosamente',
      comprobanteElectronico,
    });
  } catch (error) {
    await transaction.rollback();

    console.error('Error en createCotizacion:', {
      error: error.message,
      stack: error.stack,
      cotizacionId: cotizacion.id,
      clienteId: req.body.clienteId,
    });

    next(error);
  }
});

export const update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const comprobante = await ComprobantesElectronicos.findByPk(id);

  if (!comprobante) {
    return res.status(404).json({
      status: 'error',
      message: `No se encontró el comprobante con id: ${id}`,
    });
  }

  if (comprobante.estado === 'ACEPTADA') {
    return res.status(400).json({
      status: 'error',
      message: 'No se puede modificar un comprobante ya aceptado',
    });
  }

  await comprobante.update(updateData);

  return res.status(200).json({
    status: 'success',
    message: 'Comprobante actualizado correctamente',
    data: comprobante,
  });
});

export const deleteElement = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const comprobante = await ComprobantesElectronicos.findByPk(id);

  if (!comprobante) {
    return res.status(404).json({
      status: 'error',
      message: `No se encontró el comprobante con id: ${id}`,
    });
  }

  if (comprobante.estado === 'ACEPTADA') {
    return res.status(400).json({
      status: 'error',
      message: 'No se puede eliminar un comprobante ya aceptado',
    });
  }

  await comprobante.destroy();

  return res.status(200).json({
    status: 'success',
    message: `Comprobante con id: ${id} eliminado correctamente`,
  });
});
