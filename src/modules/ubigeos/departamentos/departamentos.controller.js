import { departamentos } from '../../../../jsons/departamentos.js';
import { distritos } from '../../../../jsons/distritos.js';
import { provincias } from '../../../../jsons/provincias.js';
import { catchAsync } from '../../../utils/catchAsync.js';
import { Distritos } from '../distritos/distritos.model.js';
import { Provincias } from '../provincias/provincias.model.js';
import { Departamentos } from './departamentos.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const departamentos = await Departamentos.findAll();

  return res.status(200).json({
    status: 'Success',
    results: departamentos.length,
    departamentos,
  });
});

async function populateProvincias() {
  try {
    for (const provincia of provincias) {
      await Provincias.create({
        id: provincia.id,
        provincia: provincia.Provincia,
        departamentoId: provincia.UbigeoId,
      });
    }
    console.log('provincias poblados correctamente.');
  } catch (error) {
    console.error('Error al poblar los provincias:', error);
  }
}

async function populateDistritos() {
  try {
    for (const distrito of distritos) {
      await Distritos.create({
        id: distrito.id,
        distrito: distrito.Distrito,
        provinciaId: distrito.UbigeoProvId,
      });
    }
    console.log('distritos poblados correctamente.');
  } catch (error) {
    console.error('Error al poblar los distritos:', error);
  }
}

async function populateDeparatemtos() {
  try {
    for (const departamento of departamentos) {
      await Departamentos.create({
        id: departamento.id,
        departamento: departamento.Departamento,
      });
    }
    console.log('departamentos poblados correctamente.');
  } catch (error) {
    console.error('Error al poblar los departamentos:', error);
  }
}

// populateProvincias();
// populateDeparatemtos();

// populateDistritos();
