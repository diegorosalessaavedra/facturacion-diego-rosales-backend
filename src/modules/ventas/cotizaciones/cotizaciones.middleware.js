import { AppError } from '../../../utils/AppError.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Clientes } from '../../clientesProveedores/clientes/clientes.model.js';
import { MisProductos } from '../../productos/misProductos/misProductos.model.js';
import { User } from '../../user/user.model.js';
import { PagosCotizaciones } from '../pagosCotizaciones/pagosCotizaciones.model.js';
import { ProductoCotizaciones } from '../productoCotizaciones/productoCotizaciones.model.js';
import { Cotizaciones } from './cotizaciones.model.js';

export const validExistCotizaciones = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const cotizacion = await Cotizaciones.findOne({
    where: {
      id,
    },
  });

  if (!cotizacion) {
    return next(new AppError(`the cotizacion  with id: ${id} not found `, 404));
  }

  req.cotizacion = cotizacion;
  next();
});

export const CotizacionIncludes = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const cotizacion = await Cotizaciones.findOne({
    where: {
      id,
    },
    include: [
      {
        model: User,
        as: 'usario',
      },
      {
        model: Clientes,
        as: 'cliente',
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
    ],
  });

  if (!cotizacion) {
    return next(new AppError(`the cotizacion  with id: ${id} not found `, 404));
  }

  req.cotizacion = cotizacion;
  next();
});
