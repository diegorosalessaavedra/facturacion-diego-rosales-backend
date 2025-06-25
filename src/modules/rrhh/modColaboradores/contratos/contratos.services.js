import axios from 'axios';
import FormData from 'form-data';

export const uploadFileToLaravel = async (file) => {
  const formData = new FormData();
  formData.append('file', file.buffer, file.originalname);

  const uploadUrl = `${process.env.LARAVEL_URL}/api/contratos`;

  try {
    const { data } = await axios.post(uploadUrl, formData);

    if (!data.filename) {
      throw new FileUploadError(
        'La respuesta del servicio de archivos no incluyó un nombre de archivo.'
      );
    }
    console.log('Archivo subido a Laravel con éxito:', data.filename);
    return data.filename;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || 'Error al subir el archivo a Laravel.';
    console.error('Error en uploadFileToLaravel:', errorMessage, error);
    throw new FileUploadError(errorMessage);
  }
};

/**
 * Elimina un archivo del servicio de Laravel.
 * @param {string} filename - El nombre del archivo a eliminar.
 */
export const deleteFileFromLaravel = async (filename) => {
  if (!filename) return;

  const deleteUrl = `${process.env.LARAVEL_URL}/api/contratos`;
  console.log(`Intentando eliminar archivo huérfano de Laravel: ${filename}`);

  try {
    await axios.delete(deleteUrl, { data: { filename } });
    console.log(`Archivo huérfano ${filename} eliminado con éxito de Laravel.`);
  } catch (error) {
    // Logueamos el error pero no lo relanzamos, ya que el error principal es el de la transacción.
    console.error(
      `Error al intentar eliminar archivo huérfano ${filename} de Laravel:`,
      error.response?.data || error.message
    );
  }
};

export const calcularDiasPorPeriodoAnual = (fechaInicioStr, fechaFinalStr) => {
  const parseDate = (str) => {
    const separator = str.includes('/') ? '/' : '-';
    const [year, month, day] = str.split(separator).map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  const fechaInicio = parseDate(fechaInicioStr);
  const fechaFinal = parseDate(fechaFinalStr);

  const resultado = [];
  const anioInicio = fechaInicio.getUTCFullYear();
  const anioFinal = fechaFinal.getUTCFullYear();
  const unDiaEnMs = 1000 * 60 * 60 * 24;

  for (let anio = anioInicio; anio <= anioFinal; anio++) {
    const inicioPeriodoEsteAnio =
      anio === anioInicio ? fechaInicio : new Date(Date.UTC(anio, 0, 1));

    const finPeriodoEsteAnio =
      anio === anioFinal ? fechaFinal : new Date(Date.UTC(anio, 11, 31));

    const diffTime =
      finPeriodoEsteAnio.getTime() - inicioPeriodoEsteAnio.getTime();
    const diasEnPeriodo = Math.round(diffTime / unDiaEnMs) + 1;
    const division = diasEnPeriodo / 24.33;
    const diasDisponibles =
      division % 1 >= 0.5 ? Math.ceil(division) : Math.floor(division);
    resultado.push({
      anio,
      dias_periodo: diasEnPeriodo,
      dias_disponibles: diasDisponibles,
    });
  }

  console.log(resultado);
  return resultado;
};
