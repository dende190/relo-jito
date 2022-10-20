const { EventEmitter } = require('node:events');

class Microfonos extends EventEmitter {

  #estanActivados;

  alternarSilencio() {
    const PLATAFORMA = require('../plataformas/' + process.platform + '.js');
    let comando = PLATAFORMA.MICROFONOS.SILENCIO.ALTERNAR_COMANDO;
    if (this.estanActivados === undefined) {
      this.estanActivados = false;
      comando = PLATAFORMA.MICROFONOS.SILENCIO.DESACTIVAR_COMANDO;
    }
    const { exec } = require('child_process');
    exec(comando, this.notificarSilencioCambio.bind(this));
  }

  notificarSilencioCambio(error, stdout, stderr) {
    if (error) {
      // TODO: Informar el error
      return;
    }
    if (stderr) {
      // TODO: Informar el error
      return;
    }
    this.estanActivados = !this.estanActivados;
    this.emit('silencioCambio', this.estanActivados);
  }

}

module.exports = new Microfonos();
