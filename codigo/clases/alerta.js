module.exports = class Alerta {

  constructor(titulo, mensaje) {
    console.error('\x1b[31m' + titulo + '\x1b[0m ' + mensaje);
  }

}
