import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Proveedores } from '../../clientesProveedores/proveedores/proveedores.model.js';
import { MisProductos } from '../../productos/misProductos/misProductos.model.js';
import { Departamentos } from '../../ubigeos/departamentos/departamentos.model.js';
import { Distritos } from '../../ubigeos/distritos/distritos.model.js';
import { Provincias } from '../../ubigeos/provincias/provincias.model.js';
import { PagosComprobanteOrdenCompras } from '../pagosComprobanteOrdenCompras/pagosComprobanteOrdenCompras.model.js';
import { ProductosComprobanteOrdenCompras } from '../productosComprobanteOrdenCompras/productosComprobanteOrdenCompras.model.js';
import { ComprobantesOrdenCompras } from './comprobantesOrdenCompras.model.js';

export const validExistComprobantesOrdenCompras = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const comprobanteOrdenCompra = await ComprobantesOrdenCompras.findOne({
      where: {
        id,
      },
    });

    if (!comprobanteOrdenCompra) {
      return next(
        new AppError(
          `the comprobanteOrdenCompra  with id: ${id} not found `,
          404
        )
      );
    }

    req.comprobanteOrdenCompra = comprobanteOrdenCompra;
    next();
  }
);

export const validExistComprobantesOrdenComprasIncluide = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const comprobanteOrdenCompra = await ComprobantesOrdenCompras.findOne({
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
          model: ProductosComprobanteOrdenCompras,
          as: 'productos',
          include: { model: MisProductos, as: 'producto' },
        },
        {
          model: PagosComprobanteOrdenCompras,
          as: 'pagos',
        },
      ],
    });

    if (!comprobanteOrdenCompra) {
      return next(
        new AppError(`the ordenCompra  with id: ${id} not found `, 404)
      );
    }

    req.comprobanteOrdenCompra = comprobanteOrdenCompra;
    next();
  }
);
