import { Clientes } from '../modules/clientesProveedores/clientes/clientes.model.js';
import { Proveedores } from '../modules/clientesProveedores/proveedores/proveedores.model.js';
import { ComprobantesOrdenCompras } from '../modules/compras/comprobantesOrdenCompras/comprobantesOrdenCompras.model.js';
import { OrdenesCompra } from '../modules/compras/ordenesCompra/ordenesCompra.model.js';
import { PagosComprobanteOrdenCompras } from '../modules/compras/pagosComprobanteOrdenCompras/pagosComprobanteOrdenCompras.model.js';
import { PagosOrdenCompras } from '../modules/compras/pagosOrdenCompras/pagosOrdenCompras.model.js';
import { ProductosComprobanteOrdenCompras } from '../modules/compras/productosComprobanteOrdenCompras/productosComprobanteOrdenCompras.model.js';
import { ProductosOrdenCompras } from '../modules/compras/productosOrdenCompras/productosOrdenCompras.model.js';
import { ComprobantesElectronicos } from '../modules/comprobantes/filesComprobanteElectronicos/comprobantesElectronicos/comprobantesElectronicos.model.js';
import { ComprobanteSujetaDetraccion } from '../modules/comprobantes/filesComprobanteElectronicos/comprobanteSujetaDetraccion/comprobanteSujetaDetraccion.model.js';
import { PagosComprobantesElectronicos } from '../modules/comprobantes/filesComprobanteElectronicos/pagosComprobantesElectronicos/pagosComprobantesElectronicos.model.js';
import { ProductosComprobanteElectronico } from '../modules/comprobantes/filesComprobanteElectronicos/productosComprobanteElectronico/productosComprobanteElectronico.model.js';
import { NotasComprobante } from '../modules/comprobantes/filesNotasComprobante/notasComprobante/notasComprobante.model.js';
import { ProductosNotasComprobante } from '../modules/comprobantes/filesNotasComprobante/productosNotasComprobante/productosNotasComprobante.model.js';
import { MisProductos } from '../modules/productos/misProductos/misProductos.model.js';
import { SaldoInicialKardex } from '../modules/productos/saldoInicialKardex/saldoInicialKardex.model.js';
import { Departamentos } from '../modules/ubigeos/departamentos/departamentos.model.js';
import { Distritos } from '../modules/ubigeos/distritos/distritos.model.js';
import { Provincias } from '../modules/ubigeos/provincias/provincias.model.js';
import { User } from '../modules/user/user.model.js';
import { Cotizaciones } from '../modules/ventas/cotizaciones/cotizaciones.model.js';
import { PagosCotizaciones } from '../modules/ventas/pagosCotizaciones/pagosCotizaciones.model.js';
import { ProductoCotizaciones } from '../modules/ventas/productoCotizaciones/productoCotizaciones.model.js';
import { CargoLaboral } from '../modules/rrhh/modColaboradores/cargoLaboral/cargoLaboral.model.js';
import { Colaboradores } from '../modules/rrhh/modColaboradores/colaboradores/colaboradores.model.js';
import { DocCompleColaboradores } from '../modules/rrhh/modColaboradores/docCompleColaboradores/docCompleColaboradores.model.js';
import { DescanzoMedico } from '../modules/rrhh/modDescanzoMedico/descanzoMedico/descanzoMedico.model.js';
import { Vacaciones } from '../modules/rrhh/modVacaciones/vacaciones/vacaciones.model.js';
import { VacionesSolicitadas } from '../modules/rrhh/modVacaciones/vacionesSolicitadas/vacionesSolicitadas.model.js';

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

  MisProductos.hasMany(ProductoCotizaciones, {
    foreignKey: 'productoId',
    as: 'productosCotizaciones',
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

  // rrhh
  CargoLaboral.hasMany(Colaboradores, {
    foreignKey: 'cargo_laboral_id',
    as: 'colaboradores',
  });

  Colaboradores.belongsTo(CargoLaboral, {
    foreignKey: 'cargo_laboral_id',
    as: 'cargo_laboral',
  });

  Colaboradores.hasMany(DocCompleColaboradores, {
    foreignKey: 'colaborador_id',
    as: 'documentos_complementarios',
  });

  DocCompleColaboradores.belongsTo(Colaboradores, {
    foreignKey: 'colaborador_id',
    as: 'colaborador',
  });

  Colaboradores.hasMany(DescanzoMedico, {
    foreignKey: 'colaborador_id',
    as: 'descanzos_medicos',
  });

  DescanzoMedico.belongsTo(Colaboradores, {
    foreignKey: 'colaborador_id',
    as: 'colaborador',
  });

  Colaboradores.hasMany(Vacaciones, {
    foreignKey: 'colaborador_id',
    as: 'vacaciones',
  });

  Vacaciones.belongsTo(Colaboradores, {
    foreignKey: 'colaborador_id',
    as: 'colaborador',
  });

  Colaboradores.hasMany(VacionesSolicitadas, {
    foreignKey: 'colaborador_id',
    as: 'vacaciones_solicitadas',
  });

  VacionesSolicitadas.belongsTo(Colaboradores, {
    foreignKey: 'colaborador_id',
    as: 'colaborador',
  });
  // rrhh
};

export { initModel };
