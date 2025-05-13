import axios from 'axios';
import { catchAsync } from '../../../../utils/catchAsync.js';
import { Colaboradores } from './colaboradores.model.js';
import FormData from 'form-data';
import { AppError } from '../../../../utils/AppError.js';
import { db } from '../../../../db/db.config.js';

export const findAll = catchAsync(async (res) => {
  const colaboradores = await Colaboradores.findAll();

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
  const transaction = await db.transaction();

  try {
    const {
      nombre_colaborador,
      apellidos_colaborador,
      fecha_nacimiento_colaborador,
      dni_colaborador,
      telefono_colaborador,
      correo_colaborador,
      nombre_familiar_colaborador,
      apellidos_familiar_colaborador,
      telefono_familiar_colaborador,
      correo_familiar_colaborador,
      direccion_colaborador,
      numero_casa_colaborador,
      departamento_colaborador,
      provincia_colaborador,
      distrito_colaborador,
      codigo_postal_colaborador,
      cargo_laboral_id,
      tipo_empleo_colaborador,
      educacion_colaborador,
      nombre_institucion_educativa,
      especializacion_titulo_colaborador,
    } = req.body;

    const cvFile = req.file;

    if (!cvFile) {
      await transaction.rollback();
      return next(new AppError('El archivo CV es obligatorio', 400));
    }

    // Crear colaborador sin aún subir el archivo (pero dentro de la transacción)
    const colaborador = await Colaboradores.create(
      {
        nombre_colaborador,
        apellidos_colaborador,
        fecha_nacimiento_colaborador,
        dni_colaborador,
        telefono_colaborador,
        correo_colaborador,
        nombre_familiar_colaborador,
        apellidos_familiar_colaborador,
        telefono_familiar_colaborador,
        correo_familiar_colaborador,
        direccion_colaborador,
        numero_casa_colaborador,
        departamento_colaborador,
        provincia_colaborador,
        distrito_colaborador,
        codigo_postal_colaborador,
        cargo_laboral_id,
        tipo_empleo_colaborador,
        educacion_colaborador,
        nombre_institucion_educativa,
        especializacion_titulo_colaborador,
      },
      { transaction }
    );

    let cv_colaborador_path;

    try {
      const cvFormData = new FormData();
      cvFormData.append('file', cvFile.buffer, {
        filename: cvFile.originalname,
      });

      const uploadUrl = `${process.env.LARAVEL_URL}/api/upload/file`;

      const response = await axios.post(uploadUrl, cvFormData, {
        headers: {
          ...cvFormData.getHeaders(),
        },
      });

      cv_colaborador_path = response.data.name; // asignación sin `const`
    } catch (error) {
      await transaction.rollback();

      const message =
        error.response?.data?.message ||
        'Ocurrió un error al registrar al colaborador. Inténtalo nuevamente.';

      return next(new AppError(message, 500));
    }

    // Actualizar colaborador con el path del CV
    colaborador.cv_colaborador = cv_colaborador_path;
    await colaborador.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      status: 'success',
      message: 'El colaborador se registró correctamente!',
      colaborador,
    });
  } catch (error) {
    await transaction.rollback();
    return next(
      new AppError(
        'Ocurrió un error al registrar al colaborador. Inténtalo nuevamente.',
        500
      )
    );
  }
});
