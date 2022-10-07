const path = require('path');

const MICROFONOS_COMANDO_INICIO = 'amixer set Capture ';

module.exports = {
  ICONO: path.join(__dirname, '../icons/1024x1024.png'),
  TECLA_CONTROL: 'Ctrl',
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
