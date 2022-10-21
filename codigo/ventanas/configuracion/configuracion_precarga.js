'use strict';

const Configuracion = {

  datos: null,

  preInicializar: function() {
    window.addEventListener('DOMContentLoaded', this.inicializar.bind(this));
  },

  inicializar: async function() {
    const { ipcRenderer } = require('electron');
    this.datos = await ipcRenderer.invoke('configuracionSolicitud');
    const dTextoTamano = document.querySelector('.jsTextoTamano');
    dTextoTamano.value = this.datos.TEXTO.TAMANO_PIXELES;
    dTextoTamano.addEventListener('change', this.notificarCambio);
  },

  notificarCambio: function() {
    this.datos.TEXTO.TAMANO_PIXELES = this.value;
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('configuracionCambio', this.datos);
  },

};

Configuracion.preInicializar();
