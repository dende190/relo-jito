'use strict';

const TiemposRegistrados = {

  registros: null,
  noAplicaTexto: 'N/A',

  preInicializar: function() {
    window.addEventListener('DOMContentLoaded', this.inicializar.bind(this));
  },

  inicializar: async function() {
    const { ipcRenderer } = require('electron');
    this.registros = await ipcRenderer.invoke('tiemposRegistradosSolicitud');
    this.actualizarTabla();
    (
      document
      .querySelector('.jsFormularioRegistroNuevo')
      .addEventListener('submit', this.crearNuevoRegistro.bind(this))
    );
  },

  seleccionarRegistro: function(evento) {
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('seleccionarTiempoRegistro', evento.target.value);
  },

  actualizarTabla: function() {
    let dTablaRegistros = document.querySelector('.jsTablaRegistros');
    dTablaRegistros.innerHTML = '';
    let dTablaFilaBase = document.querySelector('.jsTablaFilaBase');
    let dListaElementoTiempoBase = (
      document
      .querySelector('.jsListaElementoTiempoBase')
    );
    (
      this
      .registros
      .forEach(
        (registro) => {
          let dTablaFilaClone = dTablaFilaBase.cloneNode(true);
          let dTablaFilaSeleccionadorBase = (
            dTablaFilaClone
            .querySelector('.jsTablaFilaSeleccionadorBase')
          );
          (
            dTablaFilaSeleccionadorBase
            .classList
            .remove('jsTablaFilaSeleccionadorBase')
          );
          dTablaFilaSeleccionadorBase.classList.add('jsTablaFilaSeleccionador');
          dTablaFilaClone.querySelector('.jsTablaFilaSeleccionador').value = (
            registro
            .id
          );
          (
            dTablaFilaClone
            .querySelector('.jsTablaFilaNombreBase')
            .textContent = registro.titulo
          );
          if (!registro.tiempos.length) {
            (
              dTablaFilaClone
              .querySelector('.jsTablaFilaTiempoBase')
              .textContent = this.noAplicaTexto
            );
            dTablaRegistros.appendChild(dTablaFilaClone);
            return;
          }

          (
            registro
            .tiempos
            .forEach(
              (tiempo) => {
                let dListaElementoTiempoClone = (
                  dListaElementoTiempoBase
                  .cloneNode(true)
                );

                (
                  dListaElementoTiempoClone
                  .querySelector('.jsListaElementoTiempoInicioBase')
                  .textContent = tiempo.inicio
                );
                (
                  dListaElementoTiempoClone
                  .querySelector('.jsListaElementoTiempoFinBase')
                  .textContent = (tiempo.fin || this.noAplicaTexto)
                );
                (
                  dListaElementoTiempoClone
                  .querySelector('.jsListaElementoTiempoDiferenciaBase')
                  .textContent = (tiempo.diferencia || this.noAplicaTexto)
                );
                (
                  dTablaFilaClone
                  .querySelector('.jsListaTiemposBase')
                  .appendChild(dListaElementoTiempoClone)
                );
              }
            )
          );
          dTablaRegistros.appendChild(dTablaFilaClone);
        }
      )
    );

    (
      document
      .querySelectorAll('.jsTablaFilaSeleccionador')
      .forEach(dElemento => {
        dElemento.addEventListener('change', this.seleccionarRegistro);
      })
    );
  },

  crearNuevoRegistro: async function(evento) {
    evento.preventDefault();
    let dFormulario = evento.target;
    let nombre = dFormulario.elements['registroNombre'].value;
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('crearTiempoRegistro', nombre);
    dFormulario.reset();
    this.registros = await ipcRenderer.invoke('tiemposRegistradosSolicitud');
    this.actualizarTabla();
  },

};

TiemposRegistrados.preInicializar();
