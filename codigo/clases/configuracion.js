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
      this.restaurar();
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
  }

  obtener = (rutaTexto = '') => {
    const rutaPartes = (
      (typeof rutaTexto === 'string') ?
      rutaTexto.split('.') :
      []
    );
    let configuracion = this.datos;
    let configuracionPorDefecto = this.obtenerPorDefecto();
    for (const rutaSeccion of rutaPartes) {
      if (configuracion !== undefined) {
        configuracion = configuracion[rutaSeccion];
      }
      configuracionPorDefecto = configuracionPorDefecto[rutaSeccion];
    }
    return (configuracion || configuracionPorDefecto);
  }

  obtenerPorDefecto = () => {
    return require('../configuracion.js');
  }

  restaurar = () => {
    this.datos = this.obtenerPorDefecto();
    return this.datos;
  }

}

module.exports = new Configuracion();
