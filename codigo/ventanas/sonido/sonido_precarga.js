'use strict';

class Sonido {

  #oscilador;

  constructor() {
    window.addEventListener('DOMContentLoaded', this.inicializar);
  }

  inicializar = () => {
    const { ipcRenderer } = require('electron');
    ipcRenderer.on('silencioCambio', this.notificarSilencioCambio);
    ipcRenderer.on('alarmaIniciada', this.iniciarAlarma);
    ipcRenderer.on('alarmaDetenida', this.detenerAlarma);
    ipcRenderer.on('recordatorio', this.notificarRecordatorio);
    ipcRenderer.on('tic', this.notificarTic);
    ipcRenderer.on('toc', this.notificarToc);
  }

  iniciarAlarma = () => {
    var contexto = new AudioContext();
    this.oscilador = contexto.createOscillator();
    this.oscilador.type = 'sine';
    this.oscilador.connect(contexto.destination);
    this.oscilador.start();
  }

  detenerAlarma = () => {
    this.oscilador.stop();
    this.oscilador = null;
  }

  eliminarAudio = () => {
    this.remove();
  }

  reproducirArchivoOgg = (archivo) => {
    const dAudio = document.createElement('audio');
    dAudio.src = ('../../../sonidos/' + archivo + '.ogg');
    dAudio.addEventListener('ended', this.eliminarAudio);
    dAudio.play();
  }

  notificarRecordatorio = (evento, tiempoEnHorasYMinutos) => {
    let dictado = new SpeechSynthesisUtterance(tiempoEnHorasYMinutos);
    speechSynthesis.speak(dictado);
  }

  notificarSilencioCambio = () => {
    this.reproducirArchivoOgg('nota_do_4x');
  }

  notificarTic = () => {
    this.reproducirArchivoOgg('notas_do_re_2x');
  }

  notificarToc = () => {
    this.reproducirArchivoOgg('notas_re_do_2x');
  }

};

new Sonido();
