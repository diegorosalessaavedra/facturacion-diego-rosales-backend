import { Op } from 'sequelize';
import { catchAsync } from '../../../utils/catchAsync.js';
import { ComprobantesOrdenCompras } from '../../compras/comprobantesOrdenCompras/comprobantesOrdenCompras.model.js';
import { ComprobantesElectronicos } from '../../comprobantes/filesComprobanteElectronicos/comprobantesElectronicos/comprobantesElectronicos.model.js';
import { NotasComprobante } from '../../comprobantes/filesNotasComprobante/notasComprobante/notasComprobante.model.js';
import { MisProductos } from './misProductos.model.js';
import { Proveedores } from '../../clientesProveedores/proveedores/proveedores.model.js';
import { ProductosNotasComprobante } from '../../comprobantes/filesNotasComprobante/productosNotasComprobante/productosNotasComprobante.model.js';

import { ProductoCotizaciones } from '../../ventas/productoCotizaciones/productoCotizaciones.model.js';
import { Cotizaciones } from '../../ventas/cotizaciones/cotizaciones.model.js';
import { ProductosOrdenCompras } from '../../compras/productosOrdenCompras/productosOrdenCompras.model.js';
import { OrdenesCompra } from '../../compras/ordenesCompra/ordenesCompra.model.js';
import { Clientes } from '../../clientesProveedores/clientes/clientes.model.js';
import { ProductosComprobanteElectronico } from '../../comprobantes/filesComprobanteElectronicos/productosComprobanteElectronico/productosComprobanteElectronico.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const misProductos = await MisProductos.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: misProductos.length,
    misProductos,
  });
});

export const findAllKardex = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  try {
    // 1. Obtener todos los productos
    const allProducts = await MisProductos.findAll({
      attributes: [
        'id',
        'nombre',
        'categoria',
        'codigoSunat',
        'codigoInterno',
        'createdAt',
        'codUnidad',
      ],
      raw: false,
    });

    if (allProducts.length === 0) {
      return res.status(200).json({
        status: 'Success',
        results: 0,
        misProductos: [],
      });
    }

    const productIds = allProducts.map((p) => p.id);

    // 2. Cotizaciones
    const cotizaciones = await ProductoCotizaciones.findAll({
      where: {
        productoId: { [Op.in]: productIds },
      },
      include: [
        {
          model: Cotizaciones,
          as: 'cotizacion',
          attributes: ['id', 'tipoCotizacion', 'fechaEmision', 'status'],
          where: {
            status: 'Activo',
            ...(startDate && endDate
              ? { fechaEmision: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
          include: [
            {
              model: ComprobantesElectronicos,
              as: 'ComprobanteElectronico',
              attributes: [
                'serie',
                'numeroSerie',
                'fechaEmision',
                'tipoComprobante',
              ],
              where: { estado: 'ACEPTADA' },
              required: false,
            },
            {
              model: Clientes,
              as: 'cliente',
              required: false,
            },
          ],
        },
      ],
    });

    // 3. Ordenes de compra
    const ordenesCompra = await ProductosOrdenCompras.findAll({
      where: { productoId: { [Op.in]: productIds } },
      include: [
        {
          model: OrdenesCompra,
          attributes: ['id', 'fechaEmision', 'status'],
          where: {
            ...(startDate && endDate
              ? { fechaEmision: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
          include: [
            {
              model: ComprobantesOrdenCompras,
              as: 'comprobante',
              attributes: [
                'serie',
                'fechaEmision',
                'tipoComprobante',
                'status',
              ],
              required: true,
              where: { status: 'Activo' },
            },
            {
              model: Proveedores,
              as: 'proveedor',
              required: false,
            },
          ],
        },
      ],
    });

    // 4. Notas de comprobante
    const notas = await ProductosNotasComprobante.findAll({
      where: { productoId: { [Op.in]: productIds } },
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
          where: {
            estado: 'ACEPTADA',
            ...(startDate && endDate
              ? { fecha_emision: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
        },
      ],
    });

    const mermas = await ProductosComprobanteElectronico.findAll({
      where: { productoId: { [Op.in]: productIds } },
      include: [
        {
          model: ComprobantesElectronicos,
          attributes: [
            'id',
            'serie',
            'numeroSerie',
            'fechaEmision',
            'tipoComprobante',
            'estado',
          ],
          where: {
            estado: 'ACEPTADA',
            tipoComprobante: 'MERMA',
            ...(startDate && endDate
              ? { fechaEmision: { [Op.between]: [startDate, endDate] } }
              : {}),
          },
        },
      ],
    });

    // 5. Agrupar relaciones por productoId
    const cotizacionesPorProducto = new Map();
    const ordenesPorProducto = new Map();
    const notasPorProducto = new Map();
    const mermasPorProducto = new Map();

    cotizaciones.forEach((c) => {
      const id = c.productoId;
      if (!cotizacionesPorProducto.has(id)) cotizacionesPorProducto.set(id, []);
      cotizacionesPorProducto.get(id).push(c);
    });

    ordenesCompra.forEach((o) => {
      const id = o.productoId;
      if (!ordenesPorProducto.has(id)) ordenesPorProducto.set(id, []);
      ordenesPorProducto.get(id).push(o);
    });

    notas.forEach((n) => {
      const id = n.productoId;
      if (!notasPorProducto.has(id)) notasPorProducto.set(id, []);
      notasPorProducto.get(id).push(n);
    });
    mermas.forEach((n) => {
      const id = n.productoId;
      if (!mermasPorProducto.has(id)) mermasPorProducto.set(id, []);
      mermasPorProducto.get(id).push(n);
    });

    // 6. Unir relaciones sin fusionar productos
    const productosCompletos = allProducts.map((producto) => {
      const plainProduct = producto.get({ plain: true });

      return {
        ...plainProduct,
        productosCotizaciones: cotizacionesPorProducto.get(producto.id) || [],
        productosOrdenCompras: ordenesPorProducto.get(producto.id) || [],
        productosNotas: notasPorProducto.get(producto.id) || [],
        productosMerma: mermasPorProducto.get(producto.id) || [],
      };
    });

    return res.status(200).json({
      status: 'Success',
      results: productosCompletos.length,
      misProductos: productosCompletos,
    });
  } catch (error) {
    console.error('Error en findAllKardex:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Error al procesar la consulta de kardex',
      error: error.message,
    });
  }
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
