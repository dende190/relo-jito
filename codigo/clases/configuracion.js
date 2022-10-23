class Configuracion {

  #archivoRuta;
  #valores;

  constructor() {
    const path = require('path');
    this.archivoRuta = path.join(__dirname, '../configuracion.json');
    this.valores = require('../configuracion.json');
  }

  actualizar(valoresNuevos) {
    this.valores = valoresNuevos;
    const fs = require('fs');
    fs.writeFileSync(this.archivoRuta, JSON.stringify(this.valores));
    return this.valores;
  }

  obtener() {
    return this.valores;
  }

}

module.exports = new Configuracion();
