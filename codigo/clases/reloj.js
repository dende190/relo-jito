const CARACTERES_CANTIDAD = 10;

module.exports = class Reloj {

  #configuracionDatos;
  #esNotorio;
  #fuente;
  #pantalla;
  #ventana;

  constructor(pantalla) {
    this.esNotorio = true;
    this.pantalla = pantalla;
    this.configuracionDatos = require('./configuracion.js').obtener();
    this.fuente = (
      require(
        (
          '../fuentes/' +
          this.configuracionDatos.ventanas.texto.fuente.replace(/ /g, '_') +
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
    this.reubicar(this.configuracionDatos);
  }

  reubicar = (configuracion) => {
    const ventanaMedidas = {
      alturaPixeles: (
        Math.ceil(
          configuracion.ventanas.texto.tamano_en_pixeles *
          this.fuente.CARACTER_FACTORES.ALTURA
        )
      ),
      anchuraPixeles: (
        CARACTERES_CANTIDAD *
        Math.ceil(
          configuracion.ventanas.texto.tamano_en_pixeles *
          this.fuente.CARACTER_FACTORES.ANCHURA
        )
      ),
    };
    const pantallaLimites = this.pantalla.bounds;
    const relojVentanaLimites = {
      height: ventanaMedidas.alturaPixeles,
      width: ventanaMedidas.anchuraPixeles,
      x: (pantallaLimites.x + configuracion.ventanas.margen_en_pixeles),
      y: (
        this.pantalla.workAreaSize.height -
        ventanaMedidas.alturaPixeles +
        pantallaLimites.y
      ),
    };
    this.ventana.setBounds(relojVentanaLimites);
    this.ventana.setAlwaysOnTop(true, 'screen-saver');
  }

  notificarConfiguracionCambio = (configuracionDatos) => {
    this.reubicar(configuracionDatos);
    this.ventana.webContents.send('configuracionCambio', configuracionDatos);
  }

  cambiarNotoriedad = (notorio) => {
    this.esNotorio = notorio;
    this.ventana.setIgnoreMouseEvents(!notorio);
    this.ventana.webContents.send('notoriedadCambio', notorio);
  }

  notificarSilencioCambio = (microfonosEstanActivados) => {
    this.ventana.webContents.send('silencioCambio', microfonosEstanActivados);
  }

  notificarTiempoCambio = (tiempoEnHorasMinutosYSegundos) => {
    (
      this
      .ventana
      .webContents
      .send('tiempoCambio', tiempoEnHorasMinutosYSegundos)
    );
  }

  obtenerId = () => {
    return this.ventana.id;
  }

  alternarTiempoRegistradoIconos = () => {
    this.ventana.webContents.send('alternarTiempoRegistradoIconos');
  }

  cerrar = () => {
    this.ventana.close();
  }

};
