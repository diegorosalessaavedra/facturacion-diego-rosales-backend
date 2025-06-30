import axios from 'axios';
import FormData from 'form-data';

export const uploadVacacionesFileToLaravel = async (file) => {
  const formData = new FormData();
  formData.append('file', file.buffer, file.originalname);

  const uploadUrl = `${process.env.LARAVEL_URL}/api/vacaciones`;

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
    console.error('Error en uploadFileToLaraveMemol:', errorMessage, error);
    throw new FileUploadError(errorMessage);
  }
};

/**
 * Elimina un archivo del servicio de Laravel.
 * @param {string} filename - El nombre del archivo a eliminar.
 */
export const deleteVacacionesFileFromLaravel = async (filename) => {
  if (!filename) return;

  const deleteUrl = `${process.env.LARAVEL_URL}/api/vacaciones`;
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
