class Configuracion {

  #archivoRuta;
  #valores;

  constructor() {
    const path = require('path');
    this.archivoRuta = path.join(__dirname, '../configuracion.json');
    this.valores = require('../configuracion.json');
  }

  obtener() {
    return this.valores;
  }

  actualizar(valoresNuevos) {
    const fs = require('fs');
    this.valores = valoresNuevos;
    fs.writeFileSync(this.archivoRuta, JSON.stringify(this.valores));
    return this.valores;
  }

}

module.exports = new Configuracion();
