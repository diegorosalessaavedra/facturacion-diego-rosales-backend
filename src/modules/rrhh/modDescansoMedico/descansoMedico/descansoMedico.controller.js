import FormData from 'form-data';
import { db } from '../../../../db/db.config.js';
import { AppError } from '../../../../utils/AppError.js';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { Colaboradores } from '../../modColaboradores/colaboradores/colaboradores.model.js';
import { DescansoMedico } from './descansoMedico.model.js';
import axios from 'axios';
import { sendEmailDescansoMedico } from '../../../../utils/nodemailer.js';

export const findAllColaboradores = catchAsync(async (req, res, next) => {
  const descansoMedicos = await Colaboradores.findAll();

  return res.status(200).json({
    status: 'Success',
    results: descansoMedicos.length,
    descansoMedicos,
  });
});

export const findAllColaborador = catchAsync(async (req, res, next) => {
  const { id: colaborador_id } = req.params; // Renombrar id a colaborador_id para claridad

  const descansoMedicos = await DescansoMedico.findAll({
    where: { colaborador_id },
  });

  return res.status(200).json({
    status: 'Success',
    results: descansoMedicos.length,
    descansoMedicos,
  });
});

export const findAll = catchAsync(async (req, res, next) => {
  const descansosMedicos = await DescansoMedico.findAll({
    include: [
      {
        model: Colaboradores,
        as: 'colaborador',
      },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: descansosMedicos.length,
    descansosMedicos,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { descansoMedico } = req;

  return res.status(200).json({
    status: 'Success',
    descansoMedico,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const transaction = await db.transaction();

  const { id: colaborador_id } = req.params; // Renombrar id a colaborador_id para claridad
  const { periodo_inicio, periodo_final, titulo_descanso_medico } = req.body;
  const file = req.file;

  let uploadedFilename = null; // Declarar la variable para almacenar el nombre del archivo subido a Laravel

  try {
    if (!file) {
      await transaction.rollback(); // No hay archivo, no hay necesidad de transacción
      return next(new AppError('No se ha subido ningún archivo.', 400));
    }

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
    });

    const uploadUrl = `${process.env.LARAVEL_URL}/api/descanzo-medico`; // Ajusta esta URL si es diferente

    const uploadResponse = await axios.post(uploadUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    uploadedFilename = uploadResponse.data.filename;

    const fecha_hoy = new Date().toLocaleDateString('es-PE');

    const descansoMedico = await DescansoMedico.create(
      {
        colaborador_id: colaborador_id, // Usar el id del colaborador de los params
        periodo_inicio,
        periodo_final,
        titulo_descanso_medico,
        fecha_solicitud: fecha_hoy,
        archivo_descanso_medico: uploadedFilename, // Asegúrate de que tu modelo descansoMedico tenga este campo
      },
      { transaction } // Asociar la creación a la transacción
    );
    await transaction.commit();

    const finddescansoMedicoSolicitada = await DescansoMedico.findOne({
      where: { id: descansoMedico.id },
      include: [{ model: Colaboradores, as: 'colaborador' }],
    });

    sendEmailDescansoMedico(finddescansoMedicoSolicitada);
    res.status(201).json({
      status: 'success',
      message: 'El descanzo médico se registró correctamente!',
      descansoMedico,
    });
  } catch (error) {
    console.error(
      'Error en la transacción de creación de descanzo médico:',
      error
    );

    await transaction.rollback();

    if (uploadedFilename) {
      try {
        // Usa el endpoint correcto para eliminar archivos en Laravel
        const deleteUrl = `${process.env.LARAVEL_URL}/api/descanzo-medico`; // Ajusta esta URL si es diferente

        console.log(
          `Intentando eliminar archivo huérfano de Laravel: ${uploadedFilename}`
        );
        // Enviar una solicitud DELETE al backend de Laravel para eliminar el archivo
        // Enviamos el nombre del archivo en el cuerpo de la solicitud (common for DELETE with body)
        await axios.delete(deleteUrl, {
          data: { filename: uploadedFilename },
        });
        console.log(
          `Archivo huérfano ${uploadedFilename} eliminado con éxito de Laravel.`
        );
      } catch (deleteError) {
        // Si falla la eliminación del archivo huérfano, simplemente loguear el error
        console.error(
          `Error al intentar eliminar archivo huérfano ${uploadedFilename} de Laravel:`,
          deleteError.response?.data || deleteError.message
        );
        // No hacemos 'return next(deleteError)' aquí, ya que queremos que se propague el error original
      }
    }
    const message =
      error.response?.data?.message || // Usar el mensaje de error de la respuesta de Axios si está disponible
      'Ocurrió un error al registrar el descanzo médico. Inténtalo nuevamente.';
    return next(new AppError(message, error.response?.status || 500));
  }
});

export const update = catchAsync(async (req, res) => {
  const { descansoMedico } = req;
  const { pendiente_autorizacion } = req.body;

  await descansoMedico.update({
    pendiente_autorizacion,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the descansoMedico information has been updated',
    descansoMedico,
  });
});

export const updateAutorizacion = catchAsync(async (req, res) => {
  const { descansoMedico } = req;
  const { pendiente_autorizacion } = req.body;

  await descansoMedico.update({
    pendiente_autorizacion,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the descansoMedico information has been updated',
    descansoMedico,
  });
});

export const deleteElement = catchAsync(async (req, res, next) => {
  const { descansoMedico } = req;

  const transaction = await db.transaction(); // Iniciar una transacción para la eliminación local

  try {
    const filenameToDelete = descansoMedico.archivo_descanso_medico; // Usar el campo correcto del modelo

    if (filenameToDelete) {
      const deleteUrl = `${process.env.LARAVEL_URL}/api/descanzo-medico`; // Ajusta esta URL si es diferente

      console.log(
        `Intentando eliminar archivo ${filenameToDelete} de Laravel en: ${deleteUrl}`
      );

      await axios
        .delete(deleteUrl, {
          data: { filename: filenameToDelete },
        })
        .catch((err) => console.log(err));

      console.log(
        `Archivo ${filenameToDelete} eliminado con éxito de Laravel.`
      );
    } else {
      console.log(
        'No hay archivo asociado a este registro de descanzo médico para eliminar en Laravel.'
      );
      // Si no hay archivo asociado, simplemente continuamos con la eliminación local
    }

    await descansoMedico.destroy({ transaction }); // Eliminar el registro usando el objeto del modelo y la transacción

    await transaction.commit();

    // --- Paso 4: Enviar respuesta de éxito ---
    return res.status(200).json({
      status: 'success',
      message: `El descanzo médico con id: ${descansoMedico.id} ha sido eliminado`,
    });
  } catch (error) {
    console.error(
      'Error al eliminar el descanzo médico o su archivo asociado:',
      error
    );

    await transaction.rollback();

    const message =
      error.response?.data?.message || // Mensaje del backend de Laravel si Axios falla
      'Ocurrió un error al eliminar el descanzo médico o su archivo asociado. Inténtalo nuevamente.';

    return next(new AppError(message, error.response?.status || 500));
  }
});
