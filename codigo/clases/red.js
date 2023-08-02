const { EventEmitter } = require('node:events');

class Red extends EventEmitter {

  static ESTADOS_VALORES = {
    'BUENO': 50,
    'MALO': 100,
  };
  static ESTADOS_IDS = {
    'BUENO': 1,
    'MEDIO': 2,
    'MALO': 3,
  };

  #ipPeticion;
  #plataforma;

  constructor() {
    super();
    this.ipPeticion = '8.8.8.8';
    this.plataforma = require('../plataformas/' + process.platform + '.js');
  }

  comprobarEstado = () => {
    const { spawn } = require('child_process');
    let argumentos = [this.ipPeticion];
    if (this.plataforma.RED?.PING_ARGUMENTO) {
      argumentos.push(this.plataforma.RED.PING_ARGUMENTO);
    }
    let ping = spawn('ping', argumentos);
    (
      ping
      .stdout
      .on(
        'data',
        (informacion) => {
          let tiempoMilisegundos = (
            informacion
            .toString()
            .trim()
            .replace(/.+time=(\d+).+/, '$1')
          );
          if (isNaN(tiempoMilisegundos)) {
            tiempoMilisegundos = 0;
          }
          this.emit('cambio', tiempoMilisegundos);
        }
      )
    );
  }

};

module.exports = new Red();
