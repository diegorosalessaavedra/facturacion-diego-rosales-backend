import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { MisProductos } from '../../productos/misProductos/misProductos.model.js';
import { ProductosOrdenCompras } from './productosOrdenCompras.model.js';

export const validExistProductosOrdenCompras = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const productoOrdenCompra = await ProductosOrdenCompras.findOne({
      where: {
        id,
      },
      include: [
        {
          model: MisProductos,
        },
      ],
    });

    if (!productoOrdenCompra) {
      return next(
        new AppError(`the productoOrdenCompra  with id: ${id} not found `, 404)
      );
    }

    req.productoOrdenCompra = productoOrdenCompra;
    next();
  }
);
