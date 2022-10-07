const path = require('path');

const MICROFONOS_COMANDO_INICIO = 'amixer set Capture ';

module.exports = {
  ICONO: path.join(__dirname, '../../iconos/1024x1024.png'),
  TECLA_CONTROL: 'Ctrl',
  MICROFONOS: {
    SONIDO: {
      ACTIVAR_COMANDO: (
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
