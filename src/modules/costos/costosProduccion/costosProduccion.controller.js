import { catchAsync } from '../../../utils/catchAsync.js';
import { CostosProduccion } from './costosProduccion.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const costosProduccion = await CostosProduccion.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: costosProduccion.length,
    costosProduccion,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { costoProduccion } = req;

  return res.status(200).json({
    status: 'Success',
    costoProduccion,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    fecha_inicio,
    fecha_fin,
    mes,
    semana,
    alimento,
    gas,
    planillas,
    agua,
    rancho,
    flete,
    otros_gastos,
    costo_produccion,
    kg_producidos,
    paquetes,
    peso_paquete,
    costo_kilo,
    precio_kilo,
    profit_kilo,
    profit_total,
    observaciones,
  } = req.body;

  const costoProduccion = await CostosProduccion.create({
    ingreso_huevo_id: id,
    fecha_inicio,
    fecha_fin,
    mes,
    semana,
    alimento,
    gas,
    planillas,
    agua,
    rancho,
    flete,
    otros_gastos,
    costo_produccion,
    kg_producidos,
    paquetes,
    peso_paquete,
    costo_kilo,
    precio_kilo,
    profit_kilo,
    profit_total,
    observaciones,
  });

  res.status(201).json({
    status: 'success',
    message: 'El costoProduccion se agrego correctamente!',
    costoProduccion,
  });
});

export const update = catchAsync(async (req, res) => {
  const { costoProduccion } = req;
  const {
    ingreso_costoProduccion_id,
    fecha_inicio,
    fecha_fin,
    mes,
    semana,
    alimento,
    gas,
    planillas,
    agua,
    rancho,
    flete,
    otros_gastos,
    costo_produccion,
    kg_producidos,
    paquetes,
    peso_paquete,
    costo_kilo,
    precio_kilo,
    profit_kilo,
    profit_total,
    observaciones,
  } = req.body;

  await costoProduccion.update({
    ingreso_costoProduccion_id,
    fecha_inicio,
    fecha_fin,
    mes,
    semana,
    alimento,
    gas,
    planillas,
    agua,
    rancho,
    flete,
    otros_gastos,
    costo_produccion,
    kg_producidos,
    paquetes,
    peso_paquete,
    costo_kilo,
    precio_kilo,
    profit_kilo,
    profit_total,
    observaciones,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the mi costoProduccion information has been updated',
    costoProduccion,
  });
});
//hola

export const deleteElement = catchAsync(async (req, res) => {
  const { costoProduccion } = req;

  await costoProduccion.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The costoProduccion with id: ${costoProduccion.id} has been deleted`,
  });
});
