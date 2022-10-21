const { EventEmitter } = require('node:events');

class Tiempo extends EventEmitter {

  #fecha;
  #segundosCantidad;

  actualizar() {
    this.fecha = new Date();
    let segundosActualesCantidad = Math.floor(this.fecha.getTime() / 1000);
    if (this.segundosCantidad === segundosActualesCantidad) {
      return;
    }
    this.segundosCantidad = segundosActualesCantidad;
    this.emit('cambio', this.obtenerEnHorasMinutosYSegundos());
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

};

module.exports = new Tiempo();
