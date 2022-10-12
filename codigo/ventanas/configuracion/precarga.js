'use strict';
const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', inicializar);

function inicializar() {
  const dTextoTamano = document.querySelector('.jsTextoTamano');
  dTextoTamano.addEventListener('change', notificarConfiguracionCambio);
}

function notificarConfiguracionCambio() {
  const cambios = {MARGEN_PIXELES: 8, TEXTO: {TAMANO_PIXELES: this.value}};
  ipcRenderer.invoke('notificarConfiguracionCambio', cambios);
}
