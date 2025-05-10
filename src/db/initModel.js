import { MetodosPago } from '../modules/ajustes/metodosPagos/metodosPago.model.js';
import { Clientes } from '../modules/clientesProveedores/clientes/clientes.model.js';
import { Origen } from '../modules/clientesProveedores/origen/origen.model.js';
import { Proveedores } from '../modules/clientesProveedores/proveedores/proveedores.model.js';
import { ComprobantesOrdenCompras } from '../modules/compras/comprobantesOrdenCompras/comprobantesOrdenCompras.model.js';
import { IngresoHuevos } from '../modules/compras/ingresoHuevos/ingresoHuevos.model.js';
import { OrdenesCompra } from '../modules/compras/ordenesCompra/ordenesCompra.model.js';
import { PagosComprobanteOrdenCompras } from '../modules/compras/pagosComprobanteOrdenCompras/pagosComprobanteOrdenCompras.model.js';
import { PagosIngresoHuevos } from '../modules/compras/pagosIngresoHuevos/pagosIngresoHuevos.model.js';
import { PagosOrdenCompras } from '../modules/compras/pagosOrdenCompras/pagosOrdenCompras.model.js';
import { ProductosComprobanteOrdenCompras } from '../modules/compras/productosComprobanteOrdenCompras/productosComprobanteOrdenCompras.model.js';
import { ProductosOrdenCompras } from '../modules/compras/productosOrdenCompras/productosOrdenCompras.model.js';
import { ComprobantesElectronicos } from '../modules/comprobantes/filesComprobanteElectronicos/comprobantesElectronicos/comprobantesElectronicos.model.js';
import { ComprobanteSujetaDetraccion } from '../modules/comprobantes/filesComprobanteElectronicos/comprobanteSujetaDetraccion/comprobanteSujetaDetraccion.model.js';
import { PagosComprobantesElectronicos } from '../modules/comprobantes/filesComprobanteElectronicos/pagosComprobantesElectronicos/pagosComprobantesElectronicos.model.js';
import { ProductosComprobanteElectronico } from '../modules/comprobantes/filesComprobanteElectronicos/productosComprobanteElectronico/productosComprobanteElectronico.model.js';
import { NotasComprobante } from '../modules/comprobantes/filesNotasComprobante/notasComprobante/notasComprobante.model.js';
import { ProductosNotasComprobante } from '../modules/comprobantes/filesNotasComprobante/productosNotasComprobante/productosNotasComprobante.model.js';
import { CostosProduccion } from '../modules/costos/costosProduccion/costosProduccion.model.js';
import { Huevos } from '../modules/productos/huevos/huevos.model.js';
import { MisProductos } from '../modules/productos/misProductos/misProductos.model.js';
import { SaldoInicialKardex } from '../modules/productos/saldoInicialKardex/saldoInicialKardex.model.js';
import { Departamentos } from '../modules/ubigeos/departamentos/departamentos.model.js';
import { Distritos } from '../modules/ubigeos/distritos/distritos.model.js';
import { Provincias } from '../modules/ubigeos/provincias/provincias.model.js';
import { User } from '../modules/user/user.model.js';
import { Cotizaciones } from '../modules/ventas/cotizaciones/cotizaciones.model.js';
import { PagosCotizaciones } from '../modules/ventas/pagosCotizaciones/pagosCotizaciones.model.js';
import { PagosVentaHuevos } from '../modules/ventas/pagosVentaHuevos/pagosVentaHuevos.model.js';
import { ProductoCotizaciones } from '../modules/ventas/productoCotizaciones/productoCotizaciones.model.js';
import { ProductosVentaHuevos } from '../modules/ventas/productosVentaHuevos/productosVentaHuevos.model.js';
import { VentasHuevos } from '../modules/ventas/ventasHuevos/ventasHuevos.model.js';

const initModel = () => {
  Cotizaciones.belongsTo(User, { foreignKey: 'usuarioId', as: 'usario' });

  Cotizaciones.belongsTo(Clientes, { foreignKey: 'clienteId', as: 'cliente' });

  Cotizaciones.hasMany(ProductoCotizaciones, {
    foreignKey: 'cotizacionId',
    as: 'productos',
  });

  Cotizaciones.hasMany(PagosCotizaciones, {
    foreignKey: 'cotizacionId',
    as: 'pagos',
  });
  Cotizaciones.belongsTo(ComprobantesElectronicos, {
    foreignKey: 'comprobanteElectronicoId',
    as: 'ComprobanteElectronico',
  });

  ProductoCotizaciones.belongsTo(Cotizaciones, {
    foreignKey: 'cotizacionId',
    as: 'cotizacion',
  });
  ProductoCotizaciones.belongsTo(MisProductos, {
    foreignKey: 'productoId',
    as: 'producto',
  });
  PagosCotizaciones.belongsTo(Cotizaciones, {
    foreignKey: 'cotizacionId',
    as: 'cotizacion',
  });

  MisProductos.hasMany(ProductosOrdenCompras, {
    foreignKey: 'productoId',
  });

  OrdenesCompra.hasMany(ProductosOrdenCompras, {
    foreignKey: 'ordenCompraId',
  });

  OrdenesCompra.belongsTo(Proveedores, {
    foreignKey: 'proveedorId',
    as: 'proveedor',
  });

  OrdenesCompra.hasMany(ProductosOrdenCompras, {
    foreignKey: 'ordenCompraId',
    as: 'productos',
  });

  OrdenesCompra.hasMany(PagosOrdenCompras, {
    foreignKey: 'ordenCompraId',
    as: 'pagos',
  });
  OrdenesCompra.belongsTo(ComprobantesOrdenCompras, {
    foreignKey: 'comprobanteOrdenCompraId',
    as: 'comprobante',
  });

  ProductosOrdenCompras.belongsTo(MisProductos, {
    foreignKey: 'productoId',
    as: 'producto',
  });

  ProductosOrdenCompras.belongsTo(OrdenesCompra, {
    foreignKey: 'ordenCompraId',
  });

  ComprobantesOrdenCompras.belongsTo(Proveedores, {
    foreignKey: 'proveedorId',
    as: 'proveedor',
  });

  ComprobantesOrdenCompras.belongsTo(User, {
    foreignKey: 'aprobadoId',
    as: 'aprobadoPor',
  });

  ComprobantesOrdenCompras.hasMany(PagosComprobanteOrdenCompras, {
    foreignKey: 'comprobanteOrdenCompraId',
    as: 'pagos',
  });

  ComprobantesOrdenCompras.hasMany(ProductosComprobanteOrdenCompras, {
    foreignKey: 'comprobanteOrdenCompraId',
    as: 'productos',
  });
  ProductosComprobanteOrdenCompras.belongsTo(ComprobantesOrdenCompras, {
    foreignKey: 'comprobanteOrdenCompraId',
  });

  ProductosComprobanteOrdenCompras.belongsTo(MisProductos, {
    foreignKey: 'productoId',
    as: 'producto',
  });

  MisProductos.hasMany(ProductosComprobanteOrdenCompras, {
    foreignKey: 'productoId',
    as: 'productosComprobanteOrden',
  });

  ComprobantesElectronicos.belongsTo(Clientes, {
    foreignKey: 'clienteId',
    as: 'cliente',
  });

  ComprobanteSujetaDetraccion.belongsTo(ComprobantesElectronicos, {
    foreignKey: 'comprobanteElectronicoId',
    as: 'detraccion',
  });

  ComprobantesElectronicos.hasOne(ComprobanteSujetaDetraccion, {
    foreignKey: 'comprobanteElectronicoId',
    as: 'detraccion',
  });

  ComprobantesElectronicos.hasMany(PagosComprobantesElectronicos, {
    foreignKey: 'comprobanteElectronicoId',
    as: 'pagos',
  });
  ComprobantesElectronicos.hasMany(ProductosComprobanteElectronico, {
    foreignKey: 'comprobanteElectronicoId',
    as: 'productos',
  });
  ProductosComprobanteElectronico.belongsTo(ComprobantesElectronicos, {
    foreignKey: 'comprobanteElectronicoId',
  });

  Cotizaciones.belongsTo(ComprobantesElectronicos, {
    foreignKey: 'comprobanteElectronicoId',
  });
  ComprobantesElectronicos.hasOne(Cotizaciones, {
    foreignKey: 'comprobanteElectronicoId',
    as: 'cotizacion',
  });

  ComprobantesElectronicos.hasOne(NotasComprobante, {
    foreignKey: 'comprobante_electronico_id',
  });

  ProductosComprobanteElectronico.belongsTo(MisProductos, {
    foreignKey: 'productoId',
    as: 'producto',
  });

  MisProductos.hasMany(ProductosComprobanteElectronico, {
    foreignKey: 'productoId',
    as: 'productosComprobante',
  });

  MisProductos.hasMany(SaldoInicialKardex, {
    foreignKey: 'miProductoId',
  });

  NotasComprobante.belongsTo(ComprobantesElectronicos, {
    foreignKey: 'comprobante_electronico_id',
  });

  NotasComprobante.belongsTo(Clientes, {
    foreignKey: 'cliente_id',
    as: 'cliente',
  });

  NotasComprobante.hasMany(ProductosNotasComprobante, {
    foreignKey: 'comprobanteNotaId',
    as: 'productos',
  });

  ProductosNotasComprobante.belongsTo(NotasComprobante, {
    foreignKey: 'comprobanteNotaId',
  });

  ProductosNotasComprobante.belongsTo(MisProductos, {
    foreignKey: 'productoId',
    as: 'producto',
  });

  MisProductos.hasMany(ProductosNotasComprobante, {
    foreignKey: 'productoId',
    as: 'productosNotas',
  });

  IngresoHuevos.belongsTo(Origen, {
    foreignKey: 'origen_id',
    as: 'origen',
  });

  Origen.hasOne(IngresoHuevos, {
    foreignKey: 'origen_id',
    as: 'ingreso_huevos',
  });

  Huevos.belongsTo(IngresoHuevos, {
    foreignKey: 'ingreso_huevos_id',
    as: 'ingreso_huevos',
  });

  IngresoHuevos.hasMany(Huevos, {
    foreignKey: 'ingreso_huevos_id',
    as: 'huevos',
  });

  PagosIngresoHuevos.belongsTo(IngresoHuevos, {
    foreignKey: 'ingreso_huevo_id',
    as: 'ingreso_huevo',
  });

  IngresoHuevos.hasOne(CostosProduccion, {
    foreignKey: 'ingreso_huevo_id',
    as: 'costo_produccion',
  });

  CostosProduccion.belongsTo(IngresoHuevos, {
    foreignKey: 'ingreso_huevo_id',
    as: 'ingreso_huevos',
  });

  IngresoHuevos.hasMany(PagosIngresoHuevos, {
    foreignKey: 'ingreso_huevo_id',
    as: 'pagos',
  });

  PagosIngresoHuevos.belongsTo(MetodosPago, {
    foreignKey: 'metodoPago_id',
  });

  MetodosPago.hasMany(PagosIngresoHuevos, {
    foreignKey: 'metodoPago_id',
  });

  PagosVentaHuevos.belongsTo(VentasHuevos, {
    foreignKey: 'venta_huevos_id',
    as: 'venta_huevos',
  });

  VentasHuevos.hasMany(PagosVentaHuevos, {
    foreignKey: 'venta_huevos_id',
    as: 'pagos',
  });

  PagosVentaHuevos.belongsTo(MetodosPago, {
    foreignKey: 'metodo_pago_id',
  });

  MetodosPago.hasMany(PagosVentaHuevos, {
    foreignKey: 'metodo_pago_id',
  });

  ProductosVentaHuevos.belongsTo(VentasHuevos, {
    foreignKey: 'venta_huevos_id',
    as: 'venta_huevos',
  });

  VentasHuevos.hasMany(ProductosVentaHuevos, {
    foreignKey: 'venta_huevos_id',
    as: 'productos',
  });

  Huevos.hasMany(ProductosVentaHuevos, {
    foreignKey: 'huevo_id',
    as: 'productos_ventas_huevos',
  });

  ProductosVentaHuevos.belongsTo(Huevos, {
    foreignKey: 'huevo_id',
    as: 'huevo',
  });

  Clientes.hasMany(Cotizaciones, {
    foreignKey: 'clienteId',
    as: 'cotizaciones',
  });
  Clientes.hasMany(ComprobantesElectronicos, {
    foreignKey: 'clienteId',
    as: 'comprobantesElectronicos',
  });
  Clientes.belongsTo(Departamentos, {
    foreignKey: 'departamentoId',
  });
  Clientes.belongsTo(Distritos, {
    foreignKey: 'distritoId',
  });
  Clientes.belongsTo(Provincias, {
    foreignKey: 'provinciaId',
  });

  Proveedores.belongsTo(Departamentos, {
    foreignKey: 'departamentoId',
  });
  Proveedores.belongsTo(Distritos, {
    foreignKey: 'distritoId',
  });
  Proveedores.belongsTo(Provincias, {
    foreignKey: 'provinciaId',
  });
};

export { initModel };
