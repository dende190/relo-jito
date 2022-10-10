'use strict';
const { ipcRenderer } = require('electron');

const OPACIDADES = {
  OPACO: '0.8',
  TRANSPARENTE: '0.1',
};

window.addEventListener('DOMContentLoaded', inicializar);

function cambiarRelojOpacidad(opacidad) {
  document.querySelector('.hora').style.opacity = opacidad;
}

function cambiarRelojNotoriedad(evento, notorio = false) {
  if (notorio) {
    cambiarRelojOpacidad(OPACIDADES.OPACO);
    return;
  }
  ipcRenderer.invoke('quitarEscuchadoresParaRaton');
  cambiarRelojOpacidad(OPACIDADES.TRANSPARENTE);
}

function inicializar() {
  const dHora = document.querySelector('.hora');
  dHora.addEventListener('click', cambiarRelojNotoriedad);

  ipcRenderer.on('cambiarRelojNotoriedad', cambiarRelojNotoriedad);
  ipcRenderer.on('notificarMicrofonosEstado', notificarMicrofonosEstado);
}

function notificarMicrofonosEstado(evento, microfonosEstanActivados) {
  const dHoraEstilos = document.querySelector('.hora').style;
  if (microfonosEstanActivados) {
    dHoraEstilos.color = '';
    return;
  }
  dHoraEstilos.color = '#f00';
}
