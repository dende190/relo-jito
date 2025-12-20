const path = require('path');

const MICROFONOS_COMANDO_INICIO = (
  'automator ' +
  path.join(__dirname, '../../librerias/microphone_toogle.workflow')
);
const MICROFONOS_COMANDO_INICIO_50_PORCIENTO = (
  'osascript -e "set volume input volume 50"'
);

module.exports = {
  ES_MACOS: true,
  ICONO: path.join(__dirname, '../../iconos/16x16.png'),
  TECLA_CONTROL: 'Command',
  MICROFONOS: {
    SILENCIO: {
      DESACTIVAR_COMANDO: (
        'osascript -e "set volume input volume 50"'
      ),
      ALTERNAR_COMANDO: (
        MICROFONOS_COMANDO_INICIO
      ),
    },
  },
};
