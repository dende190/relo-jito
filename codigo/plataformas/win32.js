const path = require('path');

const MICROFONOS = {
  COMANDO_INICIO: (
    path.join(__dirname, '../../librerias/SoundVolumeCommandLine/svcl.exe') +
    ' /Stdout '
  ),
  COMANDO_FIN: ' "Microphone"',
};

module.exports = {
  ICONO: path.join(__dirname, '../../iconos/icon.ico'),
  TECLA_CONTROL: 'Ctrl',
  MICROFONOS: {
    SILENCIO: {
      DESACTIVAR_COMANDO: (
        MICROFONOS.COMANDO_INICIO +
        '/Unmute' +
        MICROFONOS.COMANDO_FIN
      ),
      ALTERNAR_COMANDO: (
        MICROFONOS.COMANDO_INICIO +
        '/Switch' +
        MICROFONOS.COMANDO_FIN
      ),
    },
  },
};
