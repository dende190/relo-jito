'use strict';

const Sonido = {

  oscilador: null,

  preInicializar: function() {
    window.addEventListener('DOMContentLoaded', this.inicializar.bind(this));
  },

  inicializar: function() {
    const { ipcRenderer } = require('electron');
    ipcRenderer.on('silencioCambio', this.notificarSilencioCambio.bind(this));
    ipcRenderer.on('alarmaIniciada', this.iniciarAlarma.bind(this));
    ipcRenderer.on('alarmaDetenida', this.detenerAlarma.bind(this));
    ipcRenderer.on('recordatorio', this.notificarRecordatorio.bind(this));
    ipcRenderer.on('tic', this.notificarTic.bind(this));
    ipcRenderer.on('toc', this.notificarToc.bind(this));
  },

  iniciarAlarma: function() {
    var contexto = new AudioContext();
    this.oscilador = contexto.createOscillator();
    this.oscilador.type = 'sine';
    this.oscilador.connect(contexto.destination);
    this.oscilador.start();
  },

  detenerAlarma: function() {
    this.oscilador.stop();
    this.oscilador = null;
  },

  eliminarAudio: function() {
    this.remove();
  },

  reproducirArchivoOgg: function(archivo) {
    const dAudio = document.createElement('audio');
    dAudio.src = ('../../../sonidos/' + archivo + '.ogg');
    dAudio.addEventListener('ended', this.eliminarAudio);
    dAudio.play();
  },

  notificarRecordatorio: function() {
    this.reproducirArchivoOgg('notas_si_la_sol_fa_mi_re_do_re_mi_fa_sol_la_2x');
  },

  notificarSilencioCambio: function() {
    this.reproducirArchivoOgg('nota_do_4x');
  },

  notificarTic: function() {
    this.reproducirArchivoOgg('notas_do_re_2x');
  },

  notificarToc: function() {
    this.reproducirArchivoOgg('notas_re_do_2x');
  },

};

Sonido.preInicializar();
