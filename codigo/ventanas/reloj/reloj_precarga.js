'use strict';

const Reloj = {

  OPACIDADES: {
    OPACO: '0.8',
    TRANSPARENTE: '0.1',
  },

  preInicializar: function() {
    window.addEventListener('DOMContentLoaded', this.inicializar.bind(this));
  },

  inicializar: function() {
    const dHora = document.querySelector('.hora');
    dHora.addEventListener('click', this.notificarNotoriedadCambio);

    const { ipcRenderer } = require('electron');
    ipcRenderer.on('configuracionCambio', this.ajustarConfiguracion);
    ipcRenderer.on('notoriedadCambio', this.cambiarNotoriedad.bind(this));
    ipcRenderer.on('silencioCambio', this.notificarSilencioCambio);
  },

  ajustarConfiguracion: function(evento, configuracion) {
    const horaEstilos = document.querySelector('.hora').style;
    horaEstilos.fontSize = (configuracion.TEXTO.TAMANO_PIXELES + 'px');
  },

  cambiarNotoriedad: function(evento, notorio) {
    const opacidad = this.OPACIDADES[notorio ? 'OPACO' : 'TRANSPARENTE'];
    document.querySelector('.hora').style.opacity = opacidad;
  },

  notificarNotoriedadCambio: function(evento) {
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('notoriedadCambio');
  },

  notificarSilencioCambio: function(evento, microfonosEstanActivados) {
    document.querySelector('.hora').style.color = (
      microfonosEstanActivados ?
      '' :
      '#f00'
    );
  },

};

Reloj.preInicializar();
