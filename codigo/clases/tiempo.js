const { EventEmitter } = require('node:events');

class Tiempo extends EventEmitter {

  #fecha;
  #segundosCantidad;
  #registros;
  #registroIdentificadorSeleccionado;

  constructor() {
    super();
    this.registros = require('../tiempos_registrados.json');
    this.registroIdentificadorSeleccionado = (
      this.registros.length ?
      this.registros[this.registros.length - 1].id :
      0
    );
  }

  actualizar() {
    this.fecha = new Date();
    let segundosActualesCantidad = Math.floor(this.fecha.getTime() / 1000);
    if (this.segundosCantidad === segundosActualesCantidad) {
      return;
    }
    this.segundosCantidad = segundosActualesCantidad;
    this.emit('cambio', this.obtenerEnHorasMinutosYSegundos());
  }

  actualizarRegistros() {
    const fs = require('fs');
    const path = require('path');
    (
      fs
      .writeFileSync(
        path.join(__dirname, '../tiempos_registrados.json'),
        JSON.stringify(this.registros)
      )
    );
    return this.registros;
  }

  alternarEstadoRegistro() {
    let registroPosicionSeleccionado = (
      this
      .registros
      .findIndex(
        (registro) => {
          return (registro.id === this.registroIdentificadorSeleccionado)
        }
      )
    );
    if (registroPosicionSeleccionado === -1) {
      console.log('paila')
      return;
    }

    let registroTiempos = this.registros[registroPosicionSeleccionado].tiempos;
    let registroTiempoFinalPosicion = (registroTiempos.length - 1);
    if (
      !registroTiempos.length ||
      registroTiempos[registroTiempoFinalPosicion].fin
    ) {
      (
        registroTiempos
        .push({
          inicio: this.obtenerEnHorasMinutosYSegundos(),
          fin: '',
          diferencia: '',
        })
      );
      this.actualizarRegistros();
      return;
    }

    registroTiempos[registroTiempoFinalPosicion].fin = (
      this
      .obtenerEnHorasMinutosYSegundos()
    );

    const tiempoFinSeparado = (
      registroTiempos[registroTiempoFinalPosicion]
      .fin
      .split(':')
    );
    const tiempoIniciSeparado = (
      registroTiempos[registroTiempoFinalPosicion]
      .inicio
      .split(':')
    );
    const tiempoDiferenciaTexto = (
      (tiempoFinSeparado[0] - tiempoIniciSeparado[0]) + 'h' +
      ' ' +
      (tiempoFinSeparado[1] - tiempoIniciSeparado[1]) + 'm' +
      ' ' +
      (tiempoFinSeparado[2] - tiempoIniciSeparado[2]) + 's'
    );
    registroTiempos[registroTiempoFinalPosicion].diferencia = (
      tiempoDiferenciaTexto
    );
    this.actualizarRegistros();
  }

  crearRegistro(nombre) {
    (
      this
      .registros
      .push({
        id: (this.registros.length + 1),
        titulo: nombre,
        tiempos: [],
      })
    );

    this.actualizarRegistros();
  }

  mostrarEnDosCifras(numero) {
    return ('0' + numero).slice(-2);
  }

  obtenerEnHorasMinutosYSegundos() {
    const hora = this.fecha.getHours();
    const minutos = this.fecha.getMinutes();
    const segundos = this.fecha.getSeconds();
    const horasMinutosYSegundos = (
      this.mostrarEnDosCifras(hora) +
      ':' +
      this.mostrarEnDosCifras(minutos) +
      ':' +
      this.mostrarEnDosCifras(segundos)
    );
    return horasMinutosYSegundos;
  }

  obtenerRegistros() {
    return this.registros;
  }

  seleccionarRegistro(identificador) {
    this.registroIdentificadorSeleccionado = Number(identificador);
  }

};

module.exports = new Tiempo();
