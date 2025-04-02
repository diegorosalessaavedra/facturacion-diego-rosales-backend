import { catchAsync } from '../../../utils/catchAsync.js';
import { Proveedores } from '../../clientesProveedores/proveedores/proveedores.model.js';
import { User } from '../../user/user.model.js';
import { OrdenesCompra } from '../ordenesCompra/ordenesCompra.model.js';
import { ProductosOrdenCompras } from './productosComprobanteOrdenCompras.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const productosOrdenCompras = await ProductosOrdenCompras.findAll();

  return res.status(200).json({
    status: 'Success',
    results: productosOrdenCompras.length,
    productosOrdenCompras,
  });
});

export const findAllIdProduct = catchAsync(async (req, res, next) => {
  const { miProducto } = req;

  const productosOrdenCompras = await ProductosOrdenCompras.findAll({
    where: {
      productoId: miProducto.id,
    },
    include: [
      {
        model: OrdenesCompra,
        include: [
          { model: User, as: 'aprobadoPor' },
          { model: Proveedores, as: 'proveedor' },
        ],
      },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: productosOrdenCompras.length,
    productosOrdenCompras,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { productoOrdenCompra } = req;

  return res.status(200).json({
    status: 'Success',
    productoOrdenCompra,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { ordenCompraId, productoId, cantidad, precioUnitario, total } =
    req.body;

  const productoOrdenCompra = await ProductosOrdenCompras.create({
    ordenCompraId,
    productoId,
    cantidad,
    precioUnitario,
    total,
  });

  res.status(201).json({
    status: 'success',
    message: 'La productoOrdenCompra se agrego correctamente!',
    productoOrdenCompra,
  });
});

export const update = catchAsync(async (req, res) => {
  const { productoOrdenCompra } = req;
  const { ordenCompraId, productoId, cantidad, precioUnitario, total } =
    req.body;

  await productoOrdenCompra.update({
    ordenCompraId,
    productoId,
    cantidad,
    precioUnitario,
    total,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the productoOrdenCompra information has been updated',
    productoOrdenCompra,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { productoOrdenCompra } = req;

  await productoOrdenCompra.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The productoOrdenCompra with id: ${productoOrdenCompra.id} has been deleted`,
  });
});
