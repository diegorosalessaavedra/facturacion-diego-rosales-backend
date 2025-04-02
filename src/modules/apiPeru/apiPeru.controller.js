import axios from 'axios';
import { catchAsync } from '../../utils/catchAsync.js';

export const findDni = catchAsync(async (req, res, next) => {
  const { dni } = req.query;

  const url = `${process.env.API_PERU}/dni`;
  const token = process.env.API_PERU_TOKEN;

  if (!dni) {
    return res.status(400).json({
      status: 'Fail',
      message: 'DNI es obligatorio.',
    });
  }

  const response = await axios.post(
    url,
    { dni },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.status(200).json({
    status: 'Success',
    data: response.data.data,
  });
});

export const findRuc = catchAsync(async (req, res, next) => {
  const { ruc } = req.query;

  const url = `${process.env.API_PERU}/ruc`;
  const token = process.env.API_PERU_TOKEN;

  if (!ruc) {
    return res.status(400).json({
      status: 'Fail',
      message: 'DNI es obligatorio.',
    });
  }

  const response = await axios.post(
    url,
    { ruc },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.status(200).json({
    status: 'Success',
    data: response.data.data,
  });
});

export const findDolar = catchAsync(async (req, res, next) => {
  const { date } = req.query;

  const url = `${process.env.API_PERU}/tipo_de_cambio`;
  const token = process.env.API_PERU_TOKEN;

  if (!date) {
    return res.status(400).json({
      status: 'Fail',
      message: 'DNI es obligatorio.',
    });
  }

  const response = await axios.post(
    url,
    { fecha: date, moneda: 'USD' },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(response);

  return res.status(200).json({
    status: 'Success',
    data: response.data.data,
  });
});

// boleta();
