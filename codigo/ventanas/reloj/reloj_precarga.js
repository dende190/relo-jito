'use strict';

class Reloj {

  // TODO: Traer del archivo de configuración
  static OPACIDADES = {
    OPACO: '0.8',
    TRANSPARENTE: '0.1',
  };
  static ESTADOS_IDS = {
    'BUENO': 1,
    'MEDIO': 2,
    'BAJO': 3,
  };

  #dHora;
  #dCita;

  constructor() {
    window.addEventListener('DOMContentLoaded', this.inicializar);
  }

  inicializar = async () => {
    this.dHora = document.querySelector('.jsHora');
    this.dCita = document.querySelector('.jsCita');
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
    const configuracionDatos = (
      await ipcRenderer.invoke('configuracionSolicitud')
    );
    this.dHora.style.fontSize = (
      configuracionDatos.ventanas.texto.tamano_en_pixeles +
      'px'
    );
    ipcRenderer.on('configuracionCambio', this.ajustarConfiguracion);
    ipcRenderer.on('notoriedadCambio', this.cambiarNotoriedad);
    ipcRenderer.on('silencioCambio', this.notificarSilencioCambio);
    ipcRenderer.on('tiempoCambio', this.notificarTiempoCambio);
    ipcRenderer.on('citaCambio', this.mostrarProximaCita);
    (
      ipcRenderer
      .on('alternarTiempoRegistradoIconos', this.alternarTiempoRegistradoIconos)
    );
    ipcRenderer.on('actualizarRedEstado', this.actualizarRedEstado);
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
    ipcRenderer.invoke('alternarTiempoRegistrado');
  }

  ajustarConfiguracion = (evento, configuracionDatos) => {
    this.dHora.style.fontSize = (
      configuracionDatos.ventanas.texto.tamano_en_pixeles +
      'px'
    );
    (
      document
      .querySelectorAll('.jsTareasRegistroAlternarEstadoBoton')
      .forEach(
        (dTareasRegistroAlternarEstadoBoton) => {
          dTareasRegistroAlternarEstadoBoton.style.fontSize = (
            configuracionDatos.ventanas.texto.tamano_en_pixeles +
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

  mostrarProximaCita = (evento, proximaCita) => {
    this.dCita.innerText = (proximaCita.titulo || '');
    if (proximaCita.enlace) {
      this.dCita.href = proximaCita.enlace;
    }
  }

  actualizarRedEstado = (evento, tiempoMilisegundos) => {
    const dRedEstado = document.querySelector('.jsRedEstado');
    dRedEstado.innerText = (tiempoMilisegundos || '∞');
    if (!tiempoMilisegundos) {
      tiempoMilisegundos = Number.MAX_SAFE_INTEGER;
    }
    let verdeValor = 255;
    let rojoValor = 0;
    if (tiempoMilisegundos > 100) {
      tiempoMilisegundos = 100;
    }
    rojoValor = (tiempoMilisegundos * 255 / 100);
    verdeValor = (255 - rojoValor);
    dRedEstado.style.color = 'rgb(' + rojoValor + ', ' + verdeValor + ', 0)';
  }

}

new Reloj();
