'use strict';
let { ipcRenderer } = require('electron')

const OPACIDADES = {
  OPACO: '0.8',
  TRANSPARENTE: '0.1',
};

window.addEventListener('DOMContentLoaded', inicializar);

function cambiarRelojOpacidad(opacidad) {
  document.querySelector('.hora').style.opacity = opacidad;
}

function cambiarRelojNotoriedad(evento, notorio) {
  if (notorio === undefined) {
    notorio = (evento.currentTarget.className !== 'hora');
  }
  if (notorio) {
    cambiarRelojOpacidad(OPACIDADES.OPACO);
    return;
  }
  ipcRenderer.invoke('quitarEscuchadoresParaRaton');
  cambiarRelojOpacidad(OPACIDADES.TRANSPARENTE);
}

function inicializar() {
  let dHora = document.querySelector('.hora');
  dHora.addEventListener('click', cambiarRelojNotoriedad);

  ipcRenderer.on('cambiarRelojNotoriedad', cambiarRelojNotoriedad);
  ipcRenderer.on('notificarMicrofonosEstado', notificarMicrofonosEstado);
}

function notificarMicrofonosEstado(evento, microfonosEstanSilenciados) {
  if (microfonosEstanSilenciados) {
    document.querySelector('.hora').style.color = '#f00';
    return;
  }
  document.querySelector('.hora').style.color = '';
}
