'use strict';

const Sonido = {

  preInicializar: function() {
    window.addEventListener('DOMContentLoaded', this.inicializar.bind(this));
  },

  inicializar: function() {
    const { ipcRenderer } = require('electron');
    ipcRenderer.on('silencioCambio', this.notificarSilencioCambio.bind(this));
  },

  eliminarAudio: function() {
    this.remove();
  },

  notificarSilencioCambio: function() {
    const dAudio = document.createElement('audio');
    dAudio.src = '../../../sonidos/nota_do.ogg';
    dAudio.addEventListener('ended', this.eliminarAudio);
    dAudio.play();
  },

};

Sonido.preInicializar();
