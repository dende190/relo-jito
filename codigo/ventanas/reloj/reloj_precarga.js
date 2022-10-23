'use strict';

const Reloj = {

  configuracion: null,
  dHora: null,
  OPACIDADES: {
    OPACO: '0.8',
    TRANSPARENTE: '0.1',
  },

  preInicializar: function() {
    window.addEventListener('DOMContentLoaded', this.inicializar.bind(this));
  },

  inicializar: async function() {
    this.dHora = document.querySelector('.hora');
    this.dHora.addEventListener('click', this.notificarNotoriedadCambio);

    const { ipcRenderer } = require('electron');
    this.configuracion = await ipcRenderer.invoke('configuracionSolicitud');
    this.dHora.style.fontSize = (
      this.configuracion.texto.tamano_pixeles +
      'px'
    );
    ipcRenderer.on('configuracionCambio', this.ajustarConfiguracion.bind(this));
    ipcRenderer.on('notoriedadCambio', this.cambiarNotoriedad.bind(this));
    ipcRenderer.on('silencioCambio', this.notificarSilencioCambio.bind(this));
    ipcRenderer.on('tiempoCambio', this.notificarTiempoCambio.bind(this));
  },

  ajustarConfiguracion: function(evento, configuracion) {
    this.dHora.style.fontSize = (configuracion.texto.tamano_pixeles + 'px');
  },

  cambiarNotoriedad: function(evento, notorio) {
    const opacidad = this.OPACIDADES[notorio ? 'OPACO' : 'TRANSPARENTE'];
    this.dHora.style.opacity = opacidad;
  },

  notificarNotoriedadCambio: function(evento) {
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('notoriedadCambio');
  },

  notificarSilencioCambio: function(evento, microfonosEstanActivados) {
    this.dHora.style.color = (microfonosEstanActivados ? '' : '#f00');
  },

  notificarTiempoCambio: function(evento, tiempoEnHorasMinutosYSegundos) {
    this.dHora.innerText = tiempoEnHorasMinutosYSegundos;
  },

};

Reloj.preInicializar();
