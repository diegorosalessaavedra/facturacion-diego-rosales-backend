import { catchAsync } from '../../../../utils/catchAsync.js';
import { Colaboradores } from './colaboradores.model.js';
import { AppError } from '../../../../utils/AppError.js';
import { db } from '../../../../db/db.config.js';
import { CargoLaboral } from '../cargoLaboral/cargoLaboral.model.js';
import { DocCompleColaboradores } from '../docCompleColaboradores/docCompleColaboradores.model.js';
import { Contratos } from '../contratos/contratos.model.js';
import { Memos } from '../memos/memos.model.js';
import {
  deleteFileColaborador,
  uploadFileToColaborador,
} from './colaboradores.services.js';
import { Op } from 'sequelize';

export const findAll = catchAsync(async (req, res, next) => {
  const { nombreNumeroDoc, cargoLaboral } = req.query;

  // Filtro base
  const whereCliente = { estado: 'ACTIVO' };

  // Búsqueda por nombre, apellido o DNI
  if (nombreNumeroDoc && nombreNumeroDoc.length > 1) {
    const nombreBuscado = `%${nombreNumeroDoc}%`;
    whereCliente[Op.or] = [
      { nombre_colaborador: { [Op.iLike]: nombreBuscado } },
      { apellidos_colaborador: { [Op.iLike]: nombreBuscado } },
      { dni_colaborador: { [Op.iLike]: nombreBuscado } },
    ];
  }

  // Filtro por cargo laboral
  if (cargoLaboral && cargoLaboral !== 'todos') {
    whereCliente.cargo_laboral_id = cargoLaboral;
  }

  const colaboradores = await Colaboradores.findAll({
    where: whereCliente,
    include: [
      { model: CargoLaboral, as: 'cargo_laboral' },
      { model: DocCompleColaboradores, as: 'documentos_complementarios' },
      {
        model: Contratos,
        as: 'contratos',
        separate: true,
        order: [[db.literal("TO_DATE(fecha_final, 'DD/MM/YYYY')"), 'DESC']],
      },
      { model: Memos, as: 'memos' },
    ],
    order: [['apellidos_colaborador', 'ASC']],
  });

  // Función para convertir fecha DD/MM/YYYY → Date
  const parseFecha = (fecha) => {
    if (!fecha) return null;
    const [dia, mes, anio] = fecha.split('/');
    return new Date(`${anio}-${mes}-${dia}`);
  };

  // Función para calcular días restantes
  const calcularDiasRestantes = (fechaFinal) => {
    const fin = parseFecha(fechaFinal);
    const ahora = new Date();
    if (!fin) return null;
    return Math.ceil((fin - ahora) / (1000 * 60 * 60 * 24));
  };

  // Lista de promesas para guardar cambios
  const cambiosEstado = [];

  for (const colaborador of colaboradores) {
    for (const contrato of colaborador.contratos) {
      const diasRestantes = calcularDiasRestantes(contrato.fecha_final);

      if (
        diasRestantes !== null &&
        diasRestantes < 0 &&
        contrato.estado_contrato !== 'expirado'
      ) {
        contrato.estado_contrato = 'expirado';
        cambiosEstado.push(contrato.save());
      }
    }
  }

  // Guardar todos los cambios de una sola vez
  if (cambiosEstado.length > 0) {
    await Promise.all(cambiosEstado);
  }

  return res.status(200).json({
    status: 'success',
    results: colaboradores.length,
    colaboradores,
  });
});

export const findAllInactivos = catchAsync(async (req, res, next) => {
  const { nombreNumeroDoc, cargoLaboral } = req.query;

  // Filtro base
  const whereCliente = {
    estado: 'INACTIVO',
  };

  // Búsqueda por nombre, apellido o DNI
  if (nombreNumeroDoc && nombreNumeroDoc.length > 1) {
    const nombreBuscado = `%${nombreNumeroDoc}%`;

    whereCliente[Op.or] = [
      { nombre_colaborador: { [Op.iLike]: nombreBuscado } },
      { apellidos_colaborador: { [Op.iLike]: nombreBuscado } },
      { dni_colaborador: { [Op.iLike]: nombreBuscado } },
    ];
  }

  if (cargoLaboral && cargoLaboral !== 'todos') {
    whereCliente.cargo_laboral_id = cargoLaboral;
  }

  const colaboradores = await Colaboradores.findAll({
    where: whereCliente,
    include: [
      { model: CargoLaboral, as: 'cargo_laboral' },
      { model: DocCompleColaboradores, as: 'documentos_complementarios' },
      {
        model: Contratos,
        as: 'contratos',
        separate: true,
        order: [['fecha_final', 'DESC']],
      },
      { model: Memos, as: 'memos' },
    ],
  });

  return res.status(200).json({
    status: 'success',
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
  // Array para almacenar las rutas de todos los archivos subidos, para limpieza en caso de error
  const uploadedFilePaths = [];

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
      nombre_contacto_emergencia2,
      apellidos_contacto_emergencia2,
      telefono_contacto_emergencia2,
      vinculo_contacto_emergencia2,
      archivos_complementarios_names, // Nombres proporcionados por el usuario para los archivos complementarios
    } = req.body;

    // --- 1. Comprobaciones de existencia unificadas ---
    const existenceChecks = [
      {
        field: 'dni_colaborador',
        value: dni_colaborador,
        message: 'El DNI ya se encuentra registrado.',
      },
      {
        field: 'telefono_colaborador',
        value: telefono_colaborador,
        message: 'El número de teléfono ya se encuentra registrado.',
      },
      {
        field: 'correo_colaborador',
        value: correo_colaborador,
        message: 'El correo ya se encuentra registrado.',
      },
      {
        field: 'telefono_contacto_emergencia',
        value: telefono_contacto_emergencia,
        message:
          'El teléfono del contacto de emergencia ya se encuentra registrado.',
      },
    ];

    for (const check of existenceChecks) {
      const exists = await Colaboradores.findOne({
        where: { [check.field]: check.value },
        transaction, // Incluir en la transacción para consistencia
      });
      if (exists) {
        // No hacer rollback aquí, lanzar error para que lo maneje el catch
        throw new AppError(check.message, 400);
      }
    }

    // --- 2. Acceso a archivos subidos por Multer ---
    // Asumiendo que Multer está configurado con upload.fields para 'foto_colaborador', 'cv_colaborador', 'archivos_complementarios'
    const fotoFile = req.files?.['foto_colaborador']?.[0];
    const cvFile = req.files?.['cv_colaborador']?.[0];
    const complementaryFiles = req.files?.['archivos_complementarios'] || [];

    // Validar si los archivos principales son obligatorios
    if (!fotoFile) {
      throw new AppError('La foto del colaborador es obligatoria.', 400);
    }
    if (!cvFile) {
      throw new AppError('El archivo CV es obligatorio.', 400);
    }

    // --- 3. Subir archivos principales y almacenar sus rutas ---
    let foto_colaborador_path = null;
    let cv_colaborador_path = null;

    try {
      foto_colaborador_path = await uploadFileToColaborador(fotoFile);
      uploadedFilePaths.push(foto_colaborador_path); // Añadir a la lista de archivos subidos
    } catch (error) {
      console.error(
        'Error al subir la foto del colaborador:',
        error.response?.data || error.message
      );
      throw new AppError(
        'Error al subir la foto del colaborador. Inténtalo nuevamente.',
        500
      );
    }

    try {
      cv_colaborador_path = await uploadFileToColaborador(cvFile);
      uploadedFilePaths.push(cv_colaborador_path); // Añadir a la lista de archivos subidos
    } catch (error) {
      console.error(
        'Error al subir el CV del colaborador:',
        error.response?.data || error.message
      );
      throw new AppError(
        'Error al subir el CV del colaborador. Inténtalo nuevamente.',
        500
      );
    }

    // --- 4. Crear el registro del colaborador en la base de datos ---
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
        nombre_contacto_emergencia2,
        apellidos_contacto_emergencia2,
        telefono_contacto_emergencia2,
        vinculo_contacto_emergencia2,
        foto_colaborador: foto_colaborador_path, // Asignar la ruta directamente
        cv_colaborador: cv_colaborador_path, // Asignar la ruta directamente
      },
      { transaction } // Asegurarse de que la creación esté dentro de la transacción
    );

    // --- 5. Procesar y subir archivos complementarios en paralelo ---
    const uploadComplementaryPromises = complementaryFiles.map(
      async (file, i) => {
        const fileName = archivos_complementarios_names[i] || file.originalname; // Usar nombre de usuario o original
        try {
          const filePath = await uploadFileToColaborador(file);
          uploadedFilePaths.push(filePath); // Añadir a la lista de archivos subidos
          return {
            colaborador_id: colaborador.id,
            nombre_doc_complementario: fileName,
            link_doc_complementario: filePath,
          };
        } catch (error) {
          console.error(
            `Error al subir el archivo complementario ${fileName}:`,
            error.response?.data || error.message
          );
          // Lanzar un error para que Promise.all lo capture y el catch principal lo maneje
          throw new AppError(
            `Error al subir el archivo complementario ${fileName}.`,
            500
          );
        }
      }
    );

    const archivosParaCrear = await Promise.all(uploadComplementaryPromises);

    // --- 6. Guardar información de archivos complementarios en la DB ---
    if (archivosParaCrear.length > 0) {
      await DocCompleColaboradores.bulkCreate(archivosParaCrear, {
        transaction,
      });
    }

    // Si todo fue exitoso, confirmar la transacción
    await transaction.commit();

    // Enviar respuesta de éxito
    res.status(201).json({
      status: 'success',
      message: 'El colaborador y sus archivos se registraron correctamente.',
      colaborador,
    });
  } catch (error) {
    console.error('Error en la transacción de creación de colaborador:', error);

    // --- 7. Manejo de errores y limpieza (rollback y eliminación de archivos) ---
    try {
      if (transaction) {
        await transaction.rollback(); // Deshacer cambios en la base de datos
      }
    } catch (rollbackError) {
      console.error('Error al hacer rollback:', rollbackError.message);
    }

    // Eliminar todos los archivos que se subieron exitosamente antes de que fallara la transacción
    // Usar una sola función consistente para eliminar archivos
    for (const filePath of uploadedFilePaths) {
      try {
        await deleteFileColaborador(filePath); // Usar función consistente
        console.log(`Archivo eliminado: ${filePath}`);
      } catch (deleteError) {
        console.error(
          `Error al eliminar el archivo ${filePath}:`,
          deleteError.message
        );
        // Continuar con la eliminación de otros archivos, no detener el proceso aquí
      }
    }

    // Determinar el mensaje de error para el usuario
    const errorMessage =
      error instanceof AppError
        ? error.message
        : 'Ocurrió un error general al registrar al colaborador. Inténtalo nuevamente.';
    const statusCode = error instanceof AppError ? error.statusCode : 500;

    return next(new AppError(errorMessage, statusCode));
  }
});

export const update = catchAsync(async (req, res, next) => {
  const transaction = await db.transaction();
  const uploadedFilePaths = [];
  const oldFilesToDelete = [];

  try {
    const { id } = req.params;

    // Verificar que el colaborador existe
    const { colaborador } = req;
    if (!colaborador) {
      throw new AppError('Colaborador no encontrado.', 404);
    }

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
      nombre_contacto_emergencia2,
      apellidos_contacto_emergencia2,
      telefono_contacto_emergencia2,
      vinculo_contacto_emergencia2,
      archivos_complementarios_names,
      deletesDocsId,
    } = req.body;
    console.log(deletesDocsId);

    // --- 1. Comprobaciones de existencia unificadas (excluyendo el registro actual) ---
    const existenceChecks = [
      {
        field: 'dni_colaborador',
        value: dni_colaborador,
        message: 'El DNI ya se encuentra registrado.',
      },
      {
        field: 'telefono_colaborador',
        value: telefono_colaborador,
        message: 'El número de teléfono ya se encuentra registrado.',
      },
      {
        field: 'correo_colaborador',
        value: correo_colaborador,
        message: 'El correo ya se encuentra registrado.',
      },
      {
        field: 'telefono_contacto_emergencia',
        value: telefono_contacto_emergencia,
        message:
          'El teléfono del contacto de emergencia ya se encuentra registrado.',
      },
    ];

    // Validar solo campos que tengan valor
    for (const check of existenceChecks) {
      if (check.value) {
        // 👈 Solo validar si hay valor
        const exists = await Colaboradores.findOne({
          where: {
            [check.field]: check.value,
            id: { [Op.ne]: id },
          },
          transaction,
        });
        if (exists) {
          throw new AppError(check.message, 400);
        }
      }
    }

    // --- 2. Acceso a archivos subidos por Multer ---
    const fotoFile = req.files?.['foto_colaborador']?.[0];
    const cvFile = req.files?.['cv_colaborador']?.[0];
    const complementaryFiles = req.files?.['archivos_complementarios'] || [];

    // --- 3. Preparar datos para actualización ---
    const updateData = {
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
      nombre_contacto_emergencia2,
      apellidos_contacto_emergencia2,
      telefono_contacto_emergencia2,
      vinculo_contacto_emergencia2,
    };

    // Remover campos undefined para evitar sobrescribir con null
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // --- 4. Procesar foto del colaborador si se envía ---
    if (fotoFile) {
      try {
        const nuevaFotoPath = await uploadFileToColaborador(fotoFile);
        uploadedFilePaths.push(nuevaFotoPath);

        // Marcar foto antigua para eliminación
        if (colaborador.foto_colaborador) {
          oldFilesToDelete.push(colaborador.foto_colaborador);
        }

        updateData.foto_colaborador = nuevaFotoPath;
      } catch (error) {
        console.error(
          'Error al subir la nueva foto del colaborador:',
          error.response?.data || error.message
        );
        throw new AppError(
          'Error al subir la nueva foto del colaborador. Inténtalo nuevamente.',
          500
        );
      }
    }

    // --- 5. Procesar CV del colaborador si se envía ---
    if (cvFile) {
      try {
        const nuevoCvPath = await uploadFileToColaborador(cvFile);
        uploadedFilePaths.push(nuevoCvPath);

        // Marcar CV antiguo para eliminación
        if (colaborador.cv_colaborador) {
          oldFilesToDelete.push(colaborador.cv_colaborador);
        }

        updateData.cv_colaborador = nuevoCvPath;
      } catch (error) {
        console.error(
          'Error al subir el nuevo CV del colaborador:',
          error.response?.data || error.message
        );
        throw new AppError(
          'Error al subir el nuevo CV del colaborador. Inténtalo nuevamente.',
          500
        );
      }
    }

    // --- 6. Actualizar el registro del colaborador en la base de datos ---
    await Colaboradores.update(updateData, {
      where: { id },
      transaction,
    });

    // --- 7. Procesar eliminación de documentos complementarios ---
    if (
      deletesDocsId &&
      Array.isArray(deletesDocsId) &&
      deletesDocsId.length > 0
    ) {
      for (const idDoc of deletesDocsId) {
        try {
          const archivo = await DocCompleColaboradores.findOne({
            where: { id: idDoc },
            transaction,
          });

          if (archivo) {
            if (archivo.link_doc_complementario) {
              oldFilesToDelete.push(archivo.link_doc_complementario);
            }
            await archivo.destroy({ transaction }); // 👈 Agregar transaction
          } else {
            console.warn(
              `Documento con ID ${idDoc} no encontrado para eliminar`
            );
          }
        } catch (error) {
          console.error(`Error al eliminar documento ${idDoc}:`, error.message);
          throw new AppError(
            `Error al eliminar documento complementario.`,
            500
          );
        }
      }
    }

    // --- 8. Procesar archivos complementarios nuevos ---
    if (complementaryFiles.length > 0) {
      try {
        const uploadComplementaryPromises = complementaryFiles.map(
          async (file, i) => {
            const fileName =
              archivos_complementarios_names?.[i] || file.originalname;

            try {
              const filePath = await uploadFileToColaborador(file);
              uploadedFilePaths.push(filePath);
              return {
                colaborador_id: id,
                nombre_doc_complementario: fileName,
                link_doc_complementario: filePath,
              };
            } catch (error) {
              console.error(
                `Error al subir el archivo complementario ${fileName}:`,
                error.response?.data || error.message
              );
              throw new AppError(
                `Error al subir el archivo complementario ${fileName}.`,
                500
              );
            }
          }
        );

        const archivosParaCrear = await Promise.all(
          uploadComplementaryPromises
        );

        // Guardar información de nuevos archivos complementarios en la DB
        if (archivosParaCrear.length > 0) {
          await DocCompleColaboradores.bulkCreate(archivosParaCrear, {
            transaction,
          });
        }
      } catch (error) {
        console.error(
          'Error al procesar archivos complementarios:',
          error.message
        );
        throw error; // Re-lanzar para que sea manejado por el catch principal
      }
    }

    // --- 9. Si todo fue exitoso, confirmar la transacción ---
    await transaction.commit();

    // --- 10. Eliminar archivos antiguos después de confirmar la transacción ---
    const deletePromises = oldFilesToDelete.map(async (filePath) => {
      try {
        await deleteFileColaborador(filePath);
        console.log(`Archivo antiguo eliminado: ${filePath}`);
      } catch (deleteError) {
        console.error(
          `Error al eliminar el archivo antiguo ${filePath}:`,
          deleteError.message
        );
        // No lanzar error aquí, solo registrar el problema
      }
    });

    // Ejecutar eliminaciones en paralelo pero sin esperar
    Promise.allSettled(deletePromises);

    // --- 11. Obtener el colaborador actualizado ---
    const colaboradorActualizado = await Colaboradores.findByPk(id, {
      include: [
        {
          model: DocCompleColaboradores,
          as: 'documentos_complementarios',
        },
      ],
    });

    // --- 12. Enviar respuesta de éxito ---
    res.status(200).json({
      status: 'success',
      message: 'El colaborador se actualizó correctamente.',
      colaborador: colaboradorActualizado,
    });
  } catch (error) {
    console.error(
      'Error en la transacción de actualización de colaborador:',
      error
    );

    // --- 13. Manejo de errores y limpieza ---
    try {
      // Rollback solo si la transacción no está terminada
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
    } catch (rollbackError) {
      console.error('Error al hacer rollback:', rollbackError.message);
    }

    // Eliminar solo los archivos nuevos que se subieron antes del error
    const cleanupPromises = uploadedFilePaths.map(async (filePath) => {
      try {
        await deleteFileColaborador(filePath);
        console.log(`Archivo nuevo eliminado por error: ${filePath}`);
      } catch (deleteError) {
        console.error(
          `Error al eliminar el archivo nuevo ${filePath}:`,
          deleteError.message
        );
      }
    });

    // Ejecutar limpieza en paralelo
    await Promise.allSettled(cleanupPromises);

    // Determinar el mensaje de error para el usuario
    const errorMessage =
      error instanceof AppError
        ? error.message
        : 'Ocurrió un error general al actualizar al colaborador. Inténtalo nuevamente.';
    const statusCode = error instanceof AppError ? error.statusCode : 500;

    return next(new AppError(errorMessage, statusCode));
  }
});

export const activarColaborador = catchAsync(async (req, res) => {
  const { colaborador } = req;

  await colaborador.update({ estado: 'ACTIVO' });

  return res.status(200).json({
    status: 'success',
    message: `The colaborador with id: ${colaborador.id} has been ACTIVO`,
  });
});

export const desactivarColaborador = catchAsync(async (req, res) => {
  const { colaborador } = req;

  await colaborador.update({ estado: 'INACTIVO' });

  return res.status(200).json({
    status: 'success',
    message: `The colaborador with id: ${colaborador.id} has been deleted`,
  });
});

export const deleteElement = catchAsync(async (req, res) => {
  const { colaborador } = req;

  await colaborador.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The colaborador with id: ${colaborador.id} has been deleted`,
  });
});
