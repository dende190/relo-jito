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

  constructor() {
    super();
    this.ipPeticion = '8.8.8.8';
  }

  comprobarEstado = () => {
    const { spawn } = require('child_process');
    let ping = spawn('ping', [this.ipPeticion]);
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
