const CARACTERES_CANTIDAD = 8;

module.exports = class Reloj {

  #configuracion;
  #esNotorio;
  #fuente;
  #pantalla;
  #ventana;

  constructor(pantalla) {
    this.esNotorio = true;
    this.pantalla = pantalla;
    this.configuracion = require('./configuracion.js').obtener();
    this.fuente = (
      require(
        (
          '../fuentes/' +
          this.configuracion.texto.fuente.replace(/ /g, '_') +
          '.js'
        ),
      )
    );

    const path = require('path');
    const rutaBase = path.join(__dirname, '../ventanas/reloj/');
    const ventanaDatos = {
      focusable: false,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      transparent: true,
      webPreferences: {
        preload: (rutaBase + 'reloj_precarga.js'),
      },
    };
    const { BrowserWindow } = require('electron');
    this.ventana = new BrowserWindow(ventanaDatos);
    this.ventana.loadFile(rutaBase + 'reloj.html');
    this.reubicar(this.configuracion);
  }

  cambiarNotoriedad(notorio) {
    this.esNotorio = notorio;
    this.ventana.setIgnoreMouseEvents(!notorio);
    this.ventana.webContents.send('notoriedadCambio', notorio);
  }

  notificarConfiguracionCambio(configuracion) {
    this.reubicar(configuracion);
    this.ventana.webContents.send('configuracionCambio', configuracion);
  }

  notificarSilencioCambio(microfonosEstanActivados) {
    this.ventana.webContents.send('silencioCambio', microfonosEstanActivados);
  }

  notificarTiempoCambio(tiempoEnHorasMinutosYSegundos) {
    (
      this
      .ventana
      .webContents
      .send('tiempoCambio', tiempoEnHorasMinutosYSegundos)
    );
  }

  obtenerId() {
    return this.ventana.id;
  }

  reubicar(configuracion) {
    const ventanaMedidas = {
      alturaPixeles: (
        Math.ceil(
          configuracion.texto.tamano_pixeles *
          this.fuente.CARACTER_FACTORES.ALTURA
        )
      ),
      anchuraPixeles: (
        CARACTERES_CANTIDAD *
        Math.ceil(
          configuracion.texto.tamano_pixeles *
          this.fuente.CARACTER_FACTORES.ANCHURA
        )
      ),
    };
    const pantallaLimites = this.pantalla.bounds;
    const relojVentanaLimites = {
      height: ventanaMedidas.alturaPixeles,
      width: ventanaMedidas.anchuraPixeles,
      x: (pantallaLimites.x + configuracion.margen_pixeles),
      y: (
        this.pantalla.workAreaSize.height -
        ventanaMedidas.alturaPixeles +
        pantallaLimites.y
      ),
    };
    this.ventana.setBounds(relojVentanaLimites);
    this.ventana.setAlwaysOnTop(true, 'screen-saver');
  }

};
