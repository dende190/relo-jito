class Configuracion {

  #archivoRuta;
  #datos;

  constructor() {
    const electron = require('electron');
    const usuarioDatosDirectorio = electron.app.getPath('userData');
    const path = require('path');
    this.archivoRuta = path.join(usuarioDatosDirectorio, '/configuracion.js');
    try {
      this.datos = require(this.archivoRuta);
    } catch(error) {
      this.datos = require('../configuracion.js');
    }
  }

  actualizar = (datosNuevos) => {
    this.datos = datosNuevos;
    const fs = require('fs');
    (
      fs
      .writeFileSync(
        this.archivoRuta,
        ('module.exports=' + JSON.stringify(this.datos)),
      )
    );
    return this.datos;
  }

  obtener = () => {
    return this.datos;
  }

}

module.exports = new Configuracion();
