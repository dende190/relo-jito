const MICROFONOS_COMANDO_INICIO = 'amixer set Capture ';

module.exports = {
  ICONO: 'reloj.png',
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
