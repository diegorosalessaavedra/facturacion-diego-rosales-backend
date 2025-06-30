import nodemailer from 'nodemailer';
import { EMAIL, EMAIL_TO, PASSWORD_EMAIL, LINK_FRONT } from '../../config.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: PASSWORD_EMAIL,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error al conectar con el servidor de correo:', error);
  } else {
    console.log('Conexión exitosa con el servidor de correo');
  }
});

export const sendConfirmationEmail = async (findVacacionesSolicitada) => {
  try {
    const { colaborador, fecha_inicio, fecha_final } = findVacacionesSolicitada;

    const emailBody = `
      <div style="max-width: 600px; margin: 0 auto; padding: 24px; font-family: Arial, sans-serif; color: #333; background-color: #f8f8f8; border-radius: 8px;">
        <h2 style="color: #2e86de;">Solicitud de Vacaciones</h2>
        <p><strong>Colaborador:</strong> ${colaborador.nombre_colaborador} ${colaborador.apellidos_colaborador}</p>
        <p><strong>Fecha de inicio:</strong> ${fecha_inicio}</p>
        <p><strong>Fecha final:</strong> ${fecha_final}</p>
        <p>
          <a href="${LINK_FRONT}/rrhh/solicitudes-vacaciones" style="display: inline-block; padding: 10px 20px; background-color: #2e86de; color: #fff; text-decoration: none; border-radius: 5px;">
            Ver solicitudes
          </a>
        </p>
      </div>
    `;

    const mailOptions = {
      from: EMAIL,
      to: EMAIL_TO,
      subject: `Nueva solicitud de vacaciones de ${colaborador.nombre_colaborador} ${colaborador.apellidos_colaborador}`,
      text: `Solicitud de vacaciones:\nColaborador: ${colaborador.nombre_colaborador} ${colaborador.apellidos_colaborador}\nInicio: ${fecha_inicio}\nFin: ${fecha_final}\nVer más: ${LINK_FRONT}/rrhh/solicitudes-vacaciones`,
      html: emailBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Correo electrónico enviado a: ${EMAIL_TO}, ID: ${info.messageId}`
    );
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
  }
};
