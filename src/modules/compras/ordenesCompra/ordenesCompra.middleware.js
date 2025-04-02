import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Proveedores } from '../../clientesProveedores/proveedores/proveedores.model.js';
import { MisProductos } from '../../productos/misProductos/misProductos.model.js';
import { Departamentos } from '../../ubigeos/departamentos/departamentos.model.js';
import { Distritos } from '../../ubigeos/distritos/distritos.model.js';
import { Provincias } from '../../ubigeos/provincias/provincias.model.js';
import { PagosOrdenCompras } from '../pagosOrdenCompras/pagosOrdenCompras.model.js';
import { ProductosOrdenCompras } from '../productosOrdenCompras/productosOrdenCompras.model.js';
import { OrdenesCompra } from './ordenesCompra.model.js';

export const validExistOrdenesCompra = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const ordenCompra = await OrdenesCompra.findOne({
    where: {
      id,
    },
  });

  if (!ordenCompra) {
    return next(
      new AppError(`the ordenCompra  with id: ${id} not found `, 404)
    );
  }

  req.ordenCompra = ordenCompra;
  next();
});

export const validExistOrdenesCompraIncluide = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const ordenCompra = await OrdenesCompra.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Proveedores,
          as: 'proveedor',
          include: [
            { model: Departamentos },
            { model: Distritos },
            { model: Provincias },
          ],
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
    });

    if (!ordenCompra) {
      return next(
        new AppError(`the ordenCompra  with id: ${id} not found `, 404)
      );
    }

    req.ordenCompra = ordenCompra;
    next();
  }
);
