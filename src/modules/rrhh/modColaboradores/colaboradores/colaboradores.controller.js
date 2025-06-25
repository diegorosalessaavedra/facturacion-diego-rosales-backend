import axios from 'axios';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { Colaboradores } from './colaboradores.model.js';
import FormData from 'form-data';
import { AppError } from '../../../../utils/AppError.js';
import { db } from '../../../../db/db.config.js';
import { CargoLaboral } from '../cargoLaboral/cargoLaboral.model.js';
import { DocCompleColaboradores } from '../docCompleColaboradores/docCompleColaboradores.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const colaboradores = await Colaboradores.findAll({
    include: [
      { model: CargoLaboral, as: 'cargo_laboral' },
      { model: DocCompleColaboradores, as: 'documentos_complementarios' },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: colaboradores.length,
    colaboradores,
  });
});
export const findOne = catchAsync(async (req, res, next) => {
  const { colaborador } = req;

  return res.status(200).json({
    status: 'Success',
    colaborador,
  });
});

export const create = catchAsync(async (req, res, next) => {
  // Iniciar una transacción de base de datos para asegurar la atomicidad
  const transaction = await db.transaction();

  try {
    // Extraer datos del cuerpo de la solicitud
    const {
      nombre_colaborador,
      apellidos_colaborador,
      fecha_nacimiento_colaborador,
      dni_colaborador,
      telefono_colaborador,
      correo_colaborador,
      direccion_colaborador,
      departamento_colaborador,
      provincia_colaborador,
      distrito_colaborador,
      nombre_contacto_emergencia,
      apellidos_contacto_emergencia,
      telefono_contacto_emergencia,
      vinculo_contacto_emergencia,
      cargo_laboral_id,

      archivos_complementarios_names,
    } = req.body;

    const existDni = await Colaboradores.findOne({
      where: { dni_colaborador },
    });

    if (existDni) {
      await transaction.rollback();
      return next(new AppError('El dni ya se encuentra registrado', 400));
    }

    const existTeleFono = await Colaboradores.findOne({
      where: { telefono_colaborador },
    });

    if (existTeleFono) {
      await transaction.rollback();
      return next(
        new AppError('El numero de telefono ya se encuentra registrado', 400)
      );
    }
    const existCorreo = await Colaboradores.findOne({
      where: { correo_colaborador },
    });

    if (existCorreo) {
      await transaction.rollback();
      return next(new AppError('El correo ya se encuentra registrado', 400));
    }

    const existTelefonoEmergencia = await Colaboradores.findOne({
      where: { telefono_contacto_emergencia },
    });

    if (existTelefonoEmergencia) {
      await transaction.rollback();
      return next(
        new AppError(
          'El telfono del contacto de emergencia  ya se encuentra registrado',
          400
        )
      );
    }

    const fotoFile =
      req.file ||
      (req.files && req.files['foto_colaborador']
        ? req.files['foto_colaborador'][0]
        : null);

    const cvFile =
      req.file ||
      (req.files && req.files['cv_colaborador']
        ? req.files['cv_colaborador'][0]
        : null);

    // Acceder a los archivos complementarios desde req.files
    // Si usas upload.fields, será req.files['archivos_complementarios']
    const complementaryFiles =
      req.files && req.files['archivos_complementarios']
        ? req.files['archivos_complementarios']
        : [];

    // Validar si el archivo CV es obligatorio
    if (!fotoFile) {
      await transaction.rollback();
      return next(new AppError('La Foto es obligatorio', 400));
    }

    if (!cvFile) {
      await transaction.rollback();
      return next(new AppError('El archivo CV es obligatorio', 400));
    }

    // Array para almacenar la información de los archivos complementarios subidos
    const uploadedComplementaryFilesInfo = [];

    // --- NUEVO: Procesar y subir archivos complementarios ---
    for (let i = 0; i < complementaryFiles.length; i++) {
      const file = complementaryFiles[i];
      // Usar el nombre proporcionado por el usuario o el nombre original del archivo
      const fileName = archivos_complementarios_names[i];

      // Crear FormData para el archivo complementario actual
      const compFormData = new FormData();
      compFormData.append('file', file.buffer, file.originalname);

      // URL del servicio de Laravel para subir archivos
      const uploadUrl = `${process.env.LARAVEL_URL}/api/colaboradores`; // Considera una ruta específica para complementarios

      try {
        // Enviar el archivo complementario al servicio de Laravel
        const response = await axios.post(uploadUrl, compFormData);
        console.log(response);

        // Guardar la información relevante (nombre ingresado por el usuario y ruta retornada por el servicio)
        uploadedComplementaryFilesInfo.push({
          nombre_archivo: fileName, // Nombre ingresado por el usuario
          ruta_archivo: response.data.filename, // Ruta retornada por el servicio de Laravel
        });
      } catch (error) {
        // Si falla la subida de un archivo complementario, hacer rollback y retornar error
        console.error(
          `Error uploading complementary file ${fileName}:`,
          error.response.data
        );
        await transaction.rollback();
        const message =
          error.response?.data?.message ||
          `Error al subir el archivo complementario ${fileName}. Inténtalo nuevamente.`;
        return next(new AppError(message, 500));
      }
    }
    // --- FIN NUEVO ---

    // Crear el registro del colaborador en la base de datos
    const colaborador = await Colaboradores.create(
      {
        nombre_colaborador,
        apellidos_colaborador,
        fecha_nacimiento_colaborador,
        dni_colaborador,
        telefono_colaborador,
        correo_colaborador,
        direccion_colaborador,
        departamento_colaborador,
        provincia_colaborador,
        distrito_colaborador,
        nombre_contacto_emergencia,
        apellidos_contacto_emergencia,
        telefono_contacto_emergencia,
        vinculo_contacto_emergencia,
        cargo_laboral_id,
        cv_colaborador: '...',
      },
      { transaction } // Asegurarse de que la creación esté dentro de la transacción
    );

    let foto_colaborador_path;

    // --- Lógica existente para subir el archivo CV ---
    try {
      const fotoFormData = new FormData();
      fotoFormData.append('file', fotoFile.buffer, fotoFile.originalname);

      const uploadUrl = `${process.env.LARAVEL_URL}/api/colaboradores`; // Considera una ruta específica para CV

      const response = await axios.post(uploadUrl, fotoFormData);

      foto_colaborador_path = response.data.filename; // Obtener la ruta retornada por el servicio
    } catch (error) {
      console.error('Error uploading photo file:', error.response);
      await transaction.rollback();
      const message =
        error.response?.data?.message ||
        'Ocurrió un error al subir la foto. Inténtalo nuevamente.';
      return next(new AppError(message, 500));
    }

    colaborador.foto_colaborador = foto_colaborador_path;
    await colaborador.save({ transaction });

    let cv_colaborador_path;

    // --- Lógica existente para subir el archivo CV ---
    try {
      const cvFormData = new FormData();
      cvFormData.append('file', cvFile.buffer, cvFile.originalname);

      const uploadUrl = `${process.env.LARAVEL_URL}/api/colaboradores`; // Considera una ruta específica para CV

      const response = await axios.post(uploadUrl, cvFormData);

      cv_colaborador_path = response.data.filename; // Obtener la ruta retornada por el servicio
    } catch (error) {
      console.error(
        'Error uploading CV file:',
        error.response?.data || error.message
      );
      await transaction.rollback();
      const message =
        error.response?.data?.message ||
        'Ocurrió un error al subir el archivo CV. Inténtalo nuevamente.';
      return next(new AppError(message, 500));
    }
    // --- Fin lógica existente para subir el archivo CV ---

    // Actualizar el registro del colaborador con la ruta del CV
    colaborador.cv_colaborador = cv_colaborador_path;
    await colaborador.save({ transaction });

    // Guardar dentro de la transacción

    // --- NUEVO: Guardar información de archivos complementarios en la base de datos ---
    if (uploadedComplementaryFilesInfo.length > 0) {
      const archivosParaCrear = uploadedComplementaryFilesInfo.map(
        (fileInfo) => ({
          colaborador_id: colaborador.id, // Asociar con el colaborador recién creado
          nombre_doc_complementario: fileInfo.nombre_archivo,
          link_doc_complementario: fileInfo.ruta_archivo,
          // Añade otros campos si tu modelo DocCompleColaboradores los requiere
        })
      );
      // Usar bulkCreate para insertar múltiples registros eficientemente
      await DocCompleColaboradores.bulkCreate(archivosParaCrear, {
        transaction,
      });
    }
    // --- FIN NUEVO ---

    // Si todo fue exitoso, confirmar la transacción
    await transaction.commit();

    // Enviar respuesta de éxito
    res.status(201).json({
      status: 'success',
      message: 'El colaborador y sus archivos se registraron correctamente!',
      colaborador,
    });
  } catch (error) {
    console.error('Error in create colaborador transaction:', error);
    await transaction.rollback();
    return next(
      new AppError(
        'Ocurrió un error general al registrar al colaborador. Inténtalo nuevamente.',
        500
      )
    );
  }
});
