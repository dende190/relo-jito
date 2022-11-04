module.exports = {
  alarmas: {
    duracion_en_segundos: 5,
    sonido_activo: true,
    horarios: [
      '10:30',
      '15:30',
    ],
  },
  cronometro: {
    atajo_para_alternar_estado: 'CommandOrControl+Alt+A',
  },
  hora_hablada: {
    sonido_activo: true,
    lapso_en_minutos: 15,
  },
  microfonos: {
    atajo_para_alternar_silencio: 'CommandOrControl+Shift+X',
    sonido_para_indicar_cambio_de_silencio: true,
  },
  tic_toc: {
    sonido_activo: false,
  },
  ventanas: {
    atajo_para_alternar_notoriedad: 'CommandOrControl+Alt+X',
    margen_en_pixeles: 8,
    opacidad_en_porcentaje: {
      notable: 80,
      baja: 20,
    },
    texto: {
      fuente: 'courier new',
      grosor_de_sombra_en_pixeles: 2,
      tamano_en_pixeles: 48,
      color_normal: '#fff',
      color_para_indicar_silencio_de_microfonos: '#f00',
    },
  },
};
