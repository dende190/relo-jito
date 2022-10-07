const path = require('path');

const MICROFONOS_COMANDO_INICIO = 'amixer set Capture ';

module.exports = {
  ESTUPIDA: true,
  ICONO: path.join(__dirname, '../../iconos/icon.icns'),
  TECLA_CONTROL: 'Command',
  MICROFONOS: {
    SILENCIO: {
      DESACTIVAR_COMANDO: (
        MICROFONOS_COMANDO_INICIO +
        'cap'
      ),
      ALTERNAR_COMANDO: (
        MICROFONOS_COMANDO_INICIO +
        'toggle'
      ),
    },
  },
};
