import axios from 'axios';
import { db } from '../../../../db/db.config.js';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { numeroALetras } from '../../../../utils/numeroLetras.js';
import { Clientes } from '../../../clientesProveedores/clientes/clientes.model.js';
import { ProductosNotasComprobante } from '../productosNotasComprobante/productosNotasComprobante.model.js';
import { NotasComprobante } from './notasComprobante.model.js';
import {
  calculateTotals,
  extractDigestValue,
  formatWithLeadingZeros,
  generateQRContent,
} from '../../../../utils/functionsComprobante.js';
import { AppError } from '../../../../utils/AppError.js';
import { MisProductos } from '../../../productos/misProductos/misProductos.model.js';
import { getNotaSConfig } from '../../../../utils/functionsNota.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { fechaInicial, fechaFinal } = req.query;

  const comprobantes = await NotasComprobante.findAll();
  return res.status(200).json({
    status: 'success',
    results: comprobantes.length,
    comprobantes,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { notaComprobante } = req;

  return res.status(200).json({
    status: 'success',
    notaComprobante,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { comprobanteElectronico } = req;
  const {
    fecha_emision,
    usuarioId,
    tipo_nota,
    motivo,
    codigo_motivo,
    descripcion,
    productos,
  } = req.body;

  const { totalPrecioProductos, totalValorVenta, totalIgv } =
    calculateTotals(productos);
  const comprobanteConfig = await getNotaSConfig(
    tipo_nota,
    comprobanteElectronico.tipoComprobante
  );

  const transaction = await db.transaction();

  const cliente = await Clientes.findOne({
    where: { id: comprobanteElectronico.clienteId },
  });

  try {
    // Create comprobante
    const notaComprobante = await NotasComprobante.create(
      {
        cliente_id: comprobanteElectronico.clienteId,
        usuario_id: usuarioId,
        comprobante_electronico_id: comprobanteElectronico.id,
        numero_serie: formatWithLeadingZeros(comprobanteConfig.numeroSerie, 8),
        serie: comprobanteConfig.serie,
        fecha_emision,
        tipo_comprobante: comprobanteElectronico.tipoComprobante,
        tipo_nota,
        motivo,
        codigo_motivo,
        descripcion,
        total_valor_venta: totalValorVenta,
        total_igv: totalIgv,
        total_venta: totalPrecioProductos,
        legend: numeroALetras(totalPrecioProductos),
        estado: 'PENDIENTE',
      },
      { transaction }
    );

    let productosConStock = [];

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
      if (miProducto.conStock) {
        if (notaComprobante.tipo_nota === 'NOTA DE DEBITO') {
          if (Number(miProducto.stock) < Number(producto.cantidad)) {
            throw new AppError(
              `Stock insuficiente para el producto ${miProducto.nombre}. Stock actual: ${miProducto.stock}, Cantidad solicitada: ${producto.cantidad}`,
              400
            );
          }
        }
      }

      productosConStock.push({
        comprobanteElectronicoId: comprobanteElectronico.id,
        productoId: producto.productoId,
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario,
        total: producto.total,
      });

      await ProductosNotasComprobante.create(
        {
          comprobanteNotaId: notaComprobante.id,
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precioUnitario: producto.precioUnitario,
          total: producto.total,
        },
        { transaction }
      );
    }

    let facturaAceptada = false;

    if (comprobanteConfig.url) {
      const dataComprobante = {
        ...(comprobanteElectronico.tipoComprobante === 'FACTURA ELECTRÓNICA'
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

        tipo_comprobante: comprobanteConfig.tipoDoc,
        serie: comprobanteConfig.serie,
        correlativo: formatWithLeadingZeros(comprobanteConfig.numeroSerie, 8),
        serie_documento: comprobanteElectronico.serie,
        correlativo_documento: comprobanteElectronico.numeroSerie,
        motivo_codigo: codigo_motivo,
        motivo_descripcion: motivo,
        total_valor_venta: totalValorVenta,
        total_igv: totalIgv,
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

        const digestValue = extractDigestValue(response.data.xml);
        const qrContent = generateQRContent({
          emisorRuc: process.env.COMPANY_RUC,
          tipoComprobante: comprobanteConfig.name,
          serie: comprobanteConfig.serie,
          correlativo: formatWithLeadingZeros(comprobanteConfig.numeroSerie, 8),
          igv: totalIgv,
          total: totalPrecioProductos,
          fecha: fecha_emision,
          tipoDocCliente:
            comprobanteElectronico.tipoComprobante === 'FACTURA ELECTRÓNICA'
              ? '6'
              : '1',
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
              if (notaComprobante.tipo_nota === 'NOTA DE DEBITO') {
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
              } else {
                await miProducto.update(
                  {
                    stock:
                      Number(miProducto.stock) + Number(productoStock.cantidad),
                  },
                  {
                    transaction,
                    validate: true,
                  }
                );
              }
            }
          }
        }

        await notaComprobante.update(
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
        console.log(error.response);
        await notaComprobante.update(
          {
            estado: 'RECHAZADA',
            comprobante_electronico_id: null,
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
      notaComprobante,
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
