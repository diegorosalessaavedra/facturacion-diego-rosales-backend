import { AppError } from '../../../../utils/AppError.js';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { Clientes } from '../../../clientesProveedores/clientes/clientes.model.js';
import { MisProductos } from '../../../productos/misProductos/misProductos.model.js';
import { Departamentos } from '../../../ubigeos/departamentos/departamentos.model.js';
import { Distritos } from '../../../ubigeos/distritos/distritos.model.js';
import { Provincias } from '../../../ubigeos/provincias/provincias.model.js';
import { Cotizaciones } from '../../../ventas/cotizaciones/cotizaciones.model.js';
import { ComprobanteSujetaDetraccion } from '../comprobanteSujetaDetraccion/comprobanteSujetaDetraccion.model.js';
import { PagosComprobantesElectronicos } from '../pagosComprobantesElectronicos/pagosComprobantesElectronicos.model.js';
import { ProductosComprobanteElectronico } from '../productosComprobanteElectronico/productosComprobanteElectronico.model.js';
import { ComprobantesElectronicos } from './comprobantesElectronicos.model.js';

export const validExistComprobantesElectronicos = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const comprobanteElectronico = await ComprobantesElectronicos.findOne({
      where: {
        id,
      },
    });

    if (!comprobanteElectronico) {
      return next(
        new AppError(
          `the comprobanteElectronico  with id: ${id} not found `,
          404
        )
      );
    }

    req.comprobanteElectronico = comprobanteElectronico;
    next();
  }
);

export const validExistComprobantesElectronicosIncluide = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const comprobanteElectronico = await ComprobantesElectronicos.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Clientes,
          as: 'cliente',
          include: [
            { model: Departamentos },
            { model: Distritos },
            { model: Provincias },
          ],
        },
        { model: Cotizaciones, as: 'cotizacion' },
        { model: PagosComprobantesElectronicos, as: 'pagos' },
        { model: ComprobanteSujetaDetraccion, as: 'detraccion' },
        {
          model: ProductosComprobanteElectronico,
          as: 'productos',
          include: [{ model: MisProductos, as: 'producto' }],
        },
      ],
    });

    if (!comprobanteElectronico) {
      return next(
        new AppError(
          `the comprobanteElectronico  with id: ${id} not found `,
          404
        )
      );
    }

    req.comprobanteElectronico = comprobanteElectronico;
    next();
  }
);
