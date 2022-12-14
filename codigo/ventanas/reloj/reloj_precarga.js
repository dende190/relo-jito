'use strict';

class Reloj {

  // TODO: Traer del archivo de configuración
  static OPACIDADES = {
    OPACO: '0.8',
    TRANSPARENTE: '0.1',
  };

  #configuracionDatos;
  #dHora;

  constructor() {
    window.addEventListener('DOMContentLoaded', this.inicializar);
  }

  inicializar = async () => {
    this.dHora = document.querySelector('.jsHora');
    this.dHora.addEventListener('click', this.notificarNotoriedadCambio);
    (
      document
      .querySelectorAll('.jsTareasRegistroAlternarEstadoBoton')
      .forEach(
        (dTareasRegistroAlternarEstadoBoton) => {
          dTareasRegistroAlternarEstadoBoton
          .addEventListener('click', this.alternarTiempoRegistro)
        }
      )
    );

    const { ipcRenderer } = require('electron');
    this.configuracionDatos = (
      await ipcRenderer.invoke('configuracionSolicitud')
    );
    this.dHora.style.fontSize = (
      this.configuracionDatos.ventanas.texto.tamano_en_pixeles +
      'px'
    );
    ipcRenderer.on('configuracionCambio', this.ajustarConfiguracion);
    ipcRenderer.on('notoriedadCambio', this.cambiarNotoriedad);
    ipcRenderer.on('silencioCambio', this.notificarSilencioCambio);
    ipcRenderer.on('tiempoCambio', this.notificarTiempoCambio);
    (
      ipcRenderer
      .on('alternarTiempoRegistradoIconos', this.alternarTiempoRegistradoIconos)
    );
  }

  notificarNotoriedadCambio = (evento) => {
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('notoriedadCambio');
  }

  alternarTiempoRegistradoIconos = () => {
    (
      document
      .querySelectorAll('.jsTareasRegistroAlternarEstadoBoton')
      .forEach(
        (dTareasRegistroAlternarEstadoBoton) => {
          dTareasRegistroAlternarEstadoBoton.hidden = !(
            dTareasRegistroAlternarEstadoBoton
            .hidden
          )
        }
      )
    );
  }

  alternarTiempoRegistro = () => {
    const { ipcRenderer } = require('electron');
    this.configuracionDatos = ipcRenderer.invoke('alternarTiempoRegistrado');
  }

  ajustarConfiguracion = (evento, configuracionDatos) => {
    this.configuracionDatos = configuracionDatos;
    this.dHora.style.fontSize = (
      configuracionDatos.ventanas.texto.tamano_pixeles +
      'px'
    );
    (
      document
      .querySelectorAll('.jsTareasRegistroAlternarEstadoBoton')
      .forEach(
        (dTareasRegistroAlternarEstadoBoton) => {
          dTareasRegistroAlternarEstadoBoton.style.fontSize = (
            configuracionDatos.ventanas.texto.tamano_pixeles +
            'px'
          );
        }
      )
    );
  }

  cambiarNotoriedad = (evento, notorio) => {
    const opacidad = Reloj.OPACIDADES[notorio ? 'OPACO' : 'TRANSPARENTE'];
    document.querySelector('.relojito').style.opacity = opacidad;
  }

  notificarSilencioCambio = (evento, microfonosEstanActivados) => {
    this.dHora.style.color = (microfonosEstanActivados ? '' : '#f00');
  }

  notificarTiempoCambio = (evento, tiempoEnHorasMinutosYSegundos) => {
    this.dHora.innerText = tiempoEnHorasMinutosYSegundos;
  }

}

new Reloj();
