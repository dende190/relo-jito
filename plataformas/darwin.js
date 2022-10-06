const path = require('path');

const MICROFONOS_COMANDO_INICIO = 'amixer set Capture ';

module.exports = {
  ESTUPIDA: true,
  ICONO: path.join(__dirname, '../icons/mac/icon.icns'),
  TECLA_CONTROL: 'Command',
  MICROFONOS: {
    COMANDO_ACTIVAR_SONIDO: (
      MICROFONOS_COMANDO_INICIO +
      'cap'
    ),
    COMANDO_ALTERNAR_SILENCIO: (
      MICROFONOS_COMANDO_INICIO +
      'toggle'
    ),
  },
};
