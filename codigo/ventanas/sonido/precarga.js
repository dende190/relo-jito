'use strict';
const { ipcRenderer } = require('electron');

ipcRenderer.on('notificarMicrofonosEstado', notificarMicrofonosEstado);

function eliminarAudio() {
  this.remove();
}

function notificarMicrofonosEstado() {
  const dAudio = document.createElement('audio');
  dAudio.src = '../../../sonidos/nota_do.ogg';
  dAudio.addEventListener('ended', eliminarAudio);
  dAudio.play();
}
