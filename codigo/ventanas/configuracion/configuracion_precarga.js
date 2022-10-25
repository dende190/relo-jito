'use strict';

class Configuracion {

  #datos;

  constructor() {
    window.addEventListener('DOMContentLoaded', this.inicializar);
  }

  inicializar = async () => {
    const { ipcRenderer } = require('electron');
    this.datos = await ipcRenderer.invoke('configuracionSolicitud');
    const dTextoTamano = document.querySelector('.jsTextoTamano');
    dTextoTamano.value = this.datos.texto.tamano_pixeles;
    dTextoTamano.addEventListener('change', this.notificarCambio);
  }

  notificarCambio = (evento) => {
    this.datos.texto.tamano_pixeles = evento.target.value;
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('configuracionCambio', this.datos);
  }

}

new Configuracion();
