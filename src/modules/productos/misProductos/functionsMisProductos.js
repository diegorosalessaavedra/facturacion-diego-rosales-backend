import { SaldoInicialKardex } from '../saldoInicialKardex/saldoInicialKardex.model.js';

export const misProductosKardex = async (misProductos, endDate) => {
  const fechaActual = new Date();

  for (const producto of misProductos) {
    const combinedProducts = [
      ...producto.productosComprobanteOrden.map((p) => ({
        ...p,
        fechaEmision: p.comprobantesOrdenCompra?.fechaEmision,
      })),
      ...producto.productosNotas.map((p) => ({
        ...p,
        fechaEmision: p.notas_comprobante?.fecha_emision,
      })),
      ...producto.productosComprobante.map((p) => ({
        ...p,
        fechaEmision: p.comprobantesElectronico?.fechaEmision,
      })),
    ].sort((a, b) => new Date(a.fechaEmision) - new Date(b.fechaEmision));

    const { precioTotal = 0, cantidad = 0 } =
      producto.dataValues?.saldoInicialKardexes[0] || {};

    const precioUnitario = cantidad > 0 ? precioTotal / cantidad : 0;

    let preciosUnitarios = [Number(precioUnitario)];
    let preciosTotales = [Number(precioTotal)];
    let totalCantidades = [Number(cantidad)];

    combinedProducts.forEach((item, index) => {
      const cantidad = Number(item.dataValues?.cantidad || 0);
      const precioUnitario = Number(item.dataValues?.precioUnitario || 0);

      if (
        item.dataValues?.comprobantesOrdenCompra ||
        item.dataValues?.notas_comprobante?.tipo_nota === 'NOTA DE CREDITO'
      ) {
        const newCantidad = totalCantidades[index] + cantidad;
        totalCantidades.push(parseFloat(newCantidad.toFixed(5)));

        const newTotal = preciosTotales[index] + cantidad * precioUnitario;
        preciosTotales.push(parseFloat(newTotal.toFixed(5)));

        if (item.dataValues?.comprobantesOrdenCompra) {
          preciosUnitarios.push(
            parseFloat(
              (preciosTotales[index + 1] / totalCantidades[index + 1]).toFixed(
                5
              )
            )
          );
        } else if (newTotal === 0 && newCantidad === 0) {
          preciosUnitarios.push(parseFloat(precioUnitario.toFixed(5)));
        } else {
          preciosUnitarios.push(preciosUnitarios[index]);
        }
      } else if (item.dataValues?.comprobantesElectronico) {
        if (preciosTotales[index] > 0 && totalCantidades[index] > 0) {
          preciosUnitarios.push(
            parseFloat(
              (preciosTotales[index] / totalCantidades[index]).toFixed(5)
            )
          );
        } else {
          preciosUnitarios.push(
            preciosUnitarios[index] || parseFloat(precioUnitario.toFixed(5))
          );
        }

        const newCantidad = totalCantidades[index] - cantidad;
        totalCantidades.push(parseFloat(newCantidad.toFixed(5)));

        const newTotal =
          preciosTotales[index] - cantidad * preciosUnitarios[index + 1];
        preciosTotales.push(parseFloat(newTotal.toFixed(5)));
      }
    });

    const saldoInicialKardexFechaAnterior = await SaldoInicialKardex.findOne({
      where: { fecha: endDate, miProductoId: producto.id },
    });

    if (fechaActual.getTime() > new Date(endDate).getTime()) {
      if (!saldoInicialKardexFechaAnterior) {
        await SaldoInicialKardex.create({
          miProductoId: producto.id,
          fecha: endDate,
          cantidad:
            totalCantidades[totalCantidades.length - 1] < 0.5
              ? 0
              : totalCantidades[totalCantidades.length - 1],
          precioTotal:
            preciosTotales[preciosTotales.length - 1] < 0.5
              ? 0
              : preciosTotales[preciosTotales.length - 1],
        });
      } else {
        await saldoInicialKardexFechaAnterior.update({
          cantidad:
            totalCantidades[totalCantidades.length - 1] < 0.5
              ? 0
              : totalCantidades[totalCantidades.length - 1],
          precioTotal:
            preciosTotales[preciosTotales.length - 1] < 0.5
              ? 0
              : preciosTotales[preciosTotales.length - 1],
        });
      }
    }
  }
};

export const calculatePreviousMonth = (date) => {
  const previousMonth = new Date(date);
  previousMonth.setMonth(previousMonth.getMonth() - 1);

  // Ajustar el año si el mes es diciembre
  if (date.getMonth() === 0) {
    previousMonth.setFullYear(date.getFullYear() - 1);
  }

  return previousMonth;
};

export function formatToUTC(date) {
  const isoDate = date.toISOString(); // Convierte a formato ISO en UTC
  return isoDate.split('T')[0]; // Devuelve solo la parte de la fecha (YYYY-MM-DD)
}
