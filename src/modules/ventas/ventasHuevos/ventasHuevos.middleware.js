import { catchAsync } from '../../../utils/catchAsync.js';
import { MetodosPago } from '../../ajustes/metodosPagos/metodosPago.model.js';
import { IngresoHuevos } from '../../compras/ingresoHuevos/ingresoHuevos.model.js';
import { Huevos } from '../../productos/huevos/huevos.model.js';
import { PagosVentaHuevos } from '../pagosVentaHuevos/pagosVentaHuevos.model.js';
import { ProductosVentaHuevos } from '../productosVentaHuevos/productosVentaHuevos.model.js';
import { VentasHuevos } from './ventasHuevos.model.js';

export const validExistVentaHuevo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const ventaHuevo = await VentasHuevos.findOne({
    where: {
      id,
    },
    include: [
      {
        model: PagosVentaHuevos,
        as: 'pagos',
        include: [{ model: MetodosPago }],
      },
      {
        model: ProductosVentaHuevos,
        as: 'productos',
        include: [
          {
            model: Huevos,
            as: 'huevo',
            include: [{ model: IngresoHuevos, as: 'ingreso_huevos' }],
          },
        ],
      },
    ],
  });

  if (!ventaHuevo) {
    return next(new AppError(`the ventaHuevo  with id: ${id} not found `, 404));
  }

  req.ventaHuevo = ventaHuevo;
  next();
});
