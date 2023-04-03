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
    this.ipPeticion = '1.1.1.1';
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
          const tiempoMilisegundos = (
            informacion
            .toString()
            .trim()
            .replace(/.+time=(\d+).+/, '$1')
          );
          if (tiempoMilisegundos < Red.ESTADOS_VALORES['BUENO']) {
            this.emit('cambio', Red.ESTADOS_IDS['BUENO']);
          } else if (
            (tiempoMilisegundos > Red.ESTADOS_VALORES['BUENO']) &&
            (tiempoMilisegundos < Red.ESTADOS_VALORES['MALO'])
          ) {
            this.emit('cambio', Red.ESTADOS_IDS['MEDIO']);
          } else {
            this.emit('cambio', Red.ESTADOS_IDS['MALO']);
          }
        }
      )
    );
  }

};

module.exports = new Red();
