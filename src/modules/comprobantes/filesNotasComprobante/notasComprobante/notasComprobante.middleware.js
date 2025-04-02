import { AppError } from '../../../../utils/AppError.js';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { Clientes } from '../../../clientesProveedores/clientes/clientes.model.js';
import { MisProductos } from '../../../productos/misProductos/misProductos.model.js';
import { Departamentos } from '../../../ubigeos/departamentos/departamentos.model.js';
import { Distritos } from '../../../ubigeos/distritos/distritos.model.js';
import { Provincias } from '../../../ubigeos/provincias/provincias.model.js';
import { ComprobantesElectronicos } from '../../filesComprobanteElectronicos/comprobantesElectronicos/comprobantesElectronicos.model.js';
import { ProductosNotasComprobante } from '../productosNotasComprobante/productosNotasComprobante.model.js';
import { NotasComprobante } from './notasComprobante.model.js';

export const validExistNotasComprobante = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const notaComprobante = await NotasComprobante.findOne({
    where: {
      id,
    },
    include: [
      { model: ComprobantesElectronicos },
      {
        model: Clientes,
        as: 'cliente',
        include: [
          { model: Departamentos },
          { model: Distritos },
          { model: Provincias },
        ],
      },
      {
        model: ProductosNotasComprobante,
        as: 'productos',
        include: [{ model: MisProductos, as: 'producto' }],
      },
    ],
  });

  if (!notaComprobante) {
    return next(
      new AppError(`the notaComprobante  with id: ${id} not found `, 404)
    );
  }

  req.notaComprobante = notaComprobante;
  next();
});
