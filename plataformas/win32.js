const path = require('path');

const MICROFONOS = {
  COMANDO_INICIO: (
    path.join(__dirname, '../librerias/SoundVolumeCommandLine/svcl.exe') +
    ' /Stdout '
  ),
  COMANDO_FIN: ' "Microphone"',
};

module.exports = {
  ICONO: path.join(__dirname, '../icons/win/icon.ico'),
  TECLA_CONTROL: 'Ctrl',
  MICROFONOS: {
    COMANDO_ACTIVAR_SONIDO: (
      MICROFONOS.COMANDO_INICIO +
      '/Unmute' +
      MICROFONOS.COMANDO_FIN
    ),
    COMANDO_ALTERNAR_SILENCIO: (
      MICROFONOS.COMANDO_INICIO +
      '/Switch' +
      MICROFONOS.COMANDO_FIN
    ),
  },
};
