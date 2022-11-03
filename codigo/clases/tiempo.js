const { EventEmitter } = require('node:events');

class Tiempo extends EventEmitter {

  #archivoRuta;
  #fecha;
  #segundosCantidad;
  #registros;
  #registroIdentificadorSeleccionado;

  constructor() {
    super();
    const electron = require('electron');
    const usuarioDatosDirectorio = electron.app.getPath('userData');
    const path = require('path');
    this.archivoRuta = (
      path
      .join(usuarioDatosDirectorio, '/tiempos_registrados.json')
    );
    try {
      this.registros = JSON.parse(fs.readFileSync(this.archivoRuta));
    } catch(error) {
      this.registros = [];
    }
    this.registroIdentificadorSeleccionado = (
      this.registros.length ?
      this.registros[this.registros.length - 1].id :
      0
    );
  }

  mostrarEnDosCifras = (numero) => {
    return ('0' + numero).slice(-2);
  }

  obtenerEnHorasMinutosYSegundos = () => {
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

  actualizar = () => {
    this.fecha = new Date();
    let segundosActualesCantidad = Math.floor(this.fecha.getTime() / 1000);
    if (this.segundosCantidad === segundosActualesCantidad) {
      return;
    }
    this.segundosCantidad = segundosActualesCantidad;
    this.emit('cambio', this.obtenerEnHorasMinutosYSegundos());
  }

  actualizarRegistros = () => {
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(this.archivoRuta, JSON.stringify(this.registros));
    return this.registros;
  }

  alternarEstadoRegistro = () => {
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

    const fecha = new Date();
    const tiempoIniciSeparado = (
      registroTiempos[registroTiempoFinalPosicion]
      .inicio
      .split(':')
    );
    const tiempoFinSeparado = (
      registroTiempos[registroTiempoFinalPosicion]
      .fin
      .split(':')
    );
    const tiempoInicioTimestamp = (
      fecha
      .setHours(
        tiempoIniciSeparado[0],
        tiempoIniciSeparado[1],
        tiempoIniciSeparado[2],
        0
      )
    );
    const tiempoFinTimestamp = (
      fecha
      .setHours(
        tiempoFinSeparado[0],
        tiempoFinSeparado[1],
        tiempoFinSeparado[2],
        0
      )
    );
    const tiemposDiferenciaSegundos = (
      (tiempoFinTimestamp - tiempoInicioTimestamp) /
      1000
    );
    const diferenciaSegundos = Math.round(tiemposDiferenciaSegundos % 60);
    const tiemposDiferenciaMinutos = (tiemposDiferenciaSegundos / 60);
    const diferenciaHoras = Math.round(tiemposDiferenciaMinutos / 60);
    const diferenciaMinutos = Math.round(tiemposDiferenciaMinutos % 60);
    const tiempoDiferenciaTexto = (
      diferenciaHoras + 'h' +
      ' ' +
      diferenciaMinutos + 'm' +
      ' ' +
      diferenciaSegundos + 's'
    );
    registroTiempos[registroTiempoFinalPosicion].diferencia = (
      tiempoDiferenciaTexto
    );
    this.actualizarRegistros();
  }

  crearRegistro = (nombre) => {
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

  obtenerRegistros = () => {
    return this.registros;
  }

  seleccionarRegistro = (identificador) => {
    this.registroIdentificadorSeleccionado = Number(identificador);
  }

};

module.exports = new Tiempo();
