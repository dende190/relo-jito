'use strict';

class Configuracion {

  #datos;

  constructor() {
    window.addEventListener('DOMContentLoaded', this.inicializar);
  }

  inicializar = async () => {
    const { ipcRenderer } = require('electron');
    this.datos = await ipcRenderer.invoke('configuracionSolicitud');
    this.mostrarDato({nivel: 2, propiedad: this.datos, ruta: ''});
  }

  mostrarDato = (dato) => {
    let propiedad = dato.propiedad;
    let ruta = dato.ruta;
    let nivel = dato.nivel;
    let dFormulario = document.querySelector('.jsFormulario');
    for (let hijoNombre in propiedad) {
      let hijoValor = propiedad[hijoNombre];
      let hijoRuta = (ruta + (ruta.length ? '.' : '') + hijoNombre);
      let dElemento;
      let esObjeto = (typeof hijoValor === 'object');
      let dNombre = document.createTextNode(hijoNombre.replace(/_/g, ' '));
      if (esObjeto) {
        dElemento = document.createElement('h' + nivel);
        dElemento.appendChild(dNombre);
      } else {
        dElemento = document.createElement('label');
        dElemento.className = 'configuracion-opcion';
        let dEntrada = document.createElement('input');
        dEntrada.className = 'configuracion-opcion_valor';
        dEntrada.addEventListener('change', this.notificarCambio);
        dEntrada.addEventListener('input', this.notificarCambio);
        dEntrada.name = hijoRuta;
        let dElementosEnOrden = [dNombre, dEntrada];
        let esBooleano = (typeof hijoValor === 'boolean');
        if (esBooleano) {
          dElementosEnOrden = [dEntrada, dNombre];
          dEntrada.type = 'checkbox';
          dEntrada.checked = hijoValor;
        } else if (typeof hijoValor === 'number') {
          dEntrada.type = 'number';
        }
        if (!esBooleano) {
          dEntrada.value = hijoValor;
        }
        dElemento.appendChild(dElementosEnOrden[0]);
        dElemento.appendChild(dElementosEnOrden[1]);
      }
      dElemento.style.marginLeft = (((nivel - 1) * 32) + 'px');
      dFormulario.appendChild(dElemento);
      if (esObjeto) {
        (
          this
          .mostrarDato(
            {nivel: (nivel + 1), propiedad: hijoValor, ruta: (hijoRuta)},
          )
        );
      }
    }
  }

  notificarCambio = (evento) => {
    let dEntrada = evento.target;
    let entradaRutaPartes = dEntrada.name.split('.');
    let dato = this.datos;
    for (
      let entradaRutaParteIndice = 0;
      entradaRutaParteIndice < (entradaRutaPartes.length - 1);
      entradaRutaParteIndice++
    ) {
      let entradaRutaParte = entradaRutaPartes[entradaRutaParteIndice];
      dato = dato[entradaRutaParte];
    }
    dato[entradaRutaPartes.pop()] = (
      dEntrada.checked ||
      (dEntrada.type === 'number' ? Number(dEntrada.value) : dEntrada.value)
    );
    const { ipcRenderer } = require('electron');
    ipcRenderer.invoke('configuracionCambio', this.datos);
  }

}

new Configuracion();
