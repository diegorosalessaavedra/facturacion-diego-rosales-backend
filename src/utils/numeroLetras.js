export const numeroALetras = (function () {
  function Unidades(num) {
    const unidades = [
      '',
      'UNO',
      'DOS',
      'TRES',
      'CUATRO',
      'CINCO',
      'SEIS',
      'SIETE',
      'OCHO',
      'NUEVE',
    ];
    return unidades[num];
  }

  function Decenas(num) {
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE'];
    const decena = Math.floor(num / 10);
    const unidad = num % 10;

    if (decena === 1 && unidad > 0)
      return especiales[unidad] || `DIECI${Unidades(unidad)}`;
    if (decena === 2)
      return unidad === 0 ? 'VEINTE' : `VEINTI${Unidades(unidad)}`;

    const nombresDecenas = [
      '',
      '',
      'VEINTE',
      'TREINTA',
      'CUARENTA',
      'CINCUENTA',
      'SESENTA',
      'SETENTA',
      'OCHENTA',
      'NOVENTA',
    ];
    return nombresDecenas[decena] + (unidad ? ` Y ${Unidades(unidad)}` : '');
  }

  function Centenas(num) {
    const centenas = Math.floor(num / 100);
    const decenas = num % 100;

    const nombresCentenas = [
      '',
      'CIENTO',
      'DOSCIENTOS',
      'TRESCIENTOS',
      'CUATROCIENTOS',
      'QUINIENTOS',
      'SEISCIENTOS',
      'SETECIENTOS',
      'OCHOCIENTOS',
      'NOVECIENTOS',
    ];

    if (centenas === 1 && decenas === 0) return 'CIEN';
    return nombresCentenas[centenas] + (decenas ? ' ' + Decenas(decenas) : '');
  }

  function Seccion(num, divisor, singular, plural) {
    const cientos = Math.floor(num / divisor);
    const resto = num % divisor;

    if (cientos === 0) return '';
    return (
      (cientos > 1 ? `${Centenas(cientos)} ${plural}` : singular) +
      (resto ? ' ' : '')
    );
  }

  function Miles(num) {
    const divisor = 1000;
    const resto = num % divisor;
    const miles = Seccion(num, divisor, 'MIL', 'MIL');

    return miles + (resto ? ' ' + Centenas(resto) : '');
  }

  function Millones(num) {
    const divisor = 1000000;
    const resto = num % divisor;
    const millones = Seccion(num, divisor, 'UN MILLÓN', 'MILLONES');

    return millones + (resto ? ' ' + Miles(resto) : '');
  }

  // Función auxiliar para convertir texto a minúsculas con la primera letra en mayúscula
  function capitalize(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }

  return function NumeroALetras(num, currency = {}) {
    // Quitar separadores de miles y convertir el número
    const sanitizedNum =
      typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;

    const data = {
      numero: sanitizedNum,
      enteros: Math.floor(sanitizedNum),
      centavos: Math.round((sanitizedNum % 1) * 100),
    };

    // Formatear los centavos como XX/100
    const centavosFormateados = `${data.centavos
      .toString()
      .padStart(2, '0')}/100`;

    if (data.enteros === 0) {
      return `Cero con ${centavosFormateados} Nuevos Soles`;
    }

    // Convertir el número a letras y aplicar el formato deseado
    let resultado = capitalize(Millones(data.enteros));

    // Agregar "con XX/100 Nuevos Soles"
    resultado = `${resultado} con ${centavosFormateados} Nuevos Soles`;

    if (resultado.trim().startsWith('y')) {
      resultado = resultado.trim().slice(2);
    }

    return resultado.toUpperCase();
  };
})();
