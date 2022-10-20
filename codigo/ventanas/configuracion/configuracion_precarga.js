'use strict';

const Configuracion = {

  preInicializar: function() {
    window.addEventListener('DOMContentLoaded', this.inicializar.bind(this));
  },

  inicializar: function() {
    const dTextoTamano = document.querySelector('.jsTextoTamano');
    dTextoTamano.addEventListener('change', this.notificarCambio);
  },

  notificarCambio: function() {
    const cambios = {MARGEN_PIXELES: 8, TEXTO: {TAMANO_PIXELES: this.value}};
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('configuracionCambio', cambios);
  },

};

Configuracion.preInicializar();
