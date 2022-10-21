class ReloJito {

  #configuracion;
  #configuracionVentana;
  #plataforma;
  #relojes;
  #sonidoVentana;

  constructor() {
    this.configuracion = require('../configuracion.js');
    this.plataforma = require('../plataformas/' + process.platform + '.js');
    this.relojes = [];

    const { ipcMain } = require('electron');
    (
      ipcMain
      .handle('notoriedadCambio', this.notificarNotoriedadCambio.bind(this))
    );
    (
      ipcMain
      .handle(
        'configuracionCambio',
        this.notificarConfiguracionCambio.bind(this),
      )
    );
    (
      ipcMain
      .handle('configuracionSolicitud', this.obtenerConfiguracion.bind(this))
    );
  }

  abrirConfiguracion() {
    if (this.configuracionVentana) {
      return;
    }
    const path = require('path');
    const rutaBase = path.join(__dirname, '../ventanas/configuracion/');
    const ventanaDatos = {
      webPreferences: {
        preload: (rutaBase + 'configuracion_precarga.js'),
      },
    };
    const { BrowserWindow } = require('electron');
    this.configuracionVentana = new BrowserWindow(ventanaDatos);
    this.configuracionVentana.on('closed', this.cerrarConfiguracion.bind(this));
    this.configuracionVentana.removeMenu();
    this.configuracionVentana.loadFile(rutaBase + 'configuracion.html');
  }

  agregar(reloj) {
    this.relojes.push(reloj);
  }

  alternarNotoriedad(evento) {
    const relojIgnorado = (
      this
      .relojes
      .find((reloj) => {return !reloj.esNotorio;})
    );
    const notorio = !!relojIgnorado;
    this.relojes.forEach((reloj) => {reloj.cambiarNotoriedad(notorio)});
  }

  cambiarNotoriedad(relojId, notorio) {
    const reloj = (
      this
      .relojes
      .find((reloj) => {return (reloj.obtenerId() === relojId);})
    );
    reloj.cambiarNotoriedad(notorio);
  }

  cerrarAplicacion() {
    if (this.plataforma.ES_MACOS) {
      return;
    }
    const { app } = require('electron');
    app.quit();
  }

  cerrarConfiguracion() {
    delete this.configuracionVentana;
  }

  crearReloj(pantalla) {
    const Reloj = require('./reloj.js');
    this.agregar(new Reloj(pantalla));
  }

  crearRelojes() {
    const { screen } = require('electron');
    screen.getAllDisplays().forEach(this.crearReloj.bind(this));
    setInterval(this.reubicar.bind(this), 1000);
  }

  inicializar() {
    this.crearRelojes();
    this.inicializarSonido();

    const microfonos = require('./microfonos.js');
    microfonos.on('silencioCambio', this.notificarSilencioCambio.bind(this));
    microfonos.alternarSilencio();

    const { Menu } = require('electron');
    const menuElementos = [
      {
        click: this.abrirConfiguracion.bind(this),
        label: 'Configurar...',
        type: 'normal',
      },
      {type: 'separator'},
      {
        accelerator: (
          this
          .configuracion
          .ATAJOS_COMBINACIONES
          .VENTANAS_ALTERNAR_NOTORIEDAD
        ),
        click: this.alternarNotoriedad.bind(this),
        label: 'Alternar notoriedad de ventanas',
        type: 'normal',
        registerAccelerator: false,
      },
      {
        accelerator: (
          this
          .configuracion
          .ATAJOS_COMBINACIONES
          .MICROFONOS_ALTERNAR_SILENCIO
        ),
        click: microfonos.alternarSilencio.bind(microfonos),
        label: 'Alternar silencio de micrófonos',
        type: 'normal',
        registerAccelerator: false,
      },
      {type: 'separator'},
      {
        click: this.cerrarAplicacion.bind(this),
        label: 'Cerrar',
        type: 'normal',
      },
    ];
    const menu = Menu.buildFromTemplate(menuElementos);

    const { Tray } = require('electron');
    const notificacionIcono = new Tray(this.plataforma.ICONO);
    notificacionIcono.setToolTip('Relo-Jito');
    notificacionIcono.setContextMenu(menu);
    notificacionIcono.on('click', this.alternarNotoriedad.bind(this));

    menuElementos.forEach(this.registrarAtajoGlobal.bind(this));

    const { app } = require('electron');
    app.on('window-all-closed', this.cerrarAplicacion.bind(this));
  }

  inicializarSonido() {
    const path = require('path');
    const rutaBase = path.join(__dirname, '../ventanas/sonido/');
    const ventanaDatos = {
      show: false,
      webPreferences: {
        preload: (rutaBase + 'sonido_precarga.js'),
      },
    };
    const { BrowserWindow } = require('electron');
    this.sonidoVentana = new BrowserWindow(ventanaDatos);
    this.sonidoVentana.removeMenu();
    this.sonidoVentana.loadFile(rutaBase + 'sonido.html');
  }

  notificarConfiguracionCambio(evento, configuracionNueva) {
    this.configuracion = configuracionNueva;
    (
      this
      .relojes
      .forEach(
        (reloj) => {
          reloj.notificarConfiguracionCambio(this.configuracion);
        },
      )
    );
  }

  notificarNotoriedadCambio(evento) {
    this.cambiarNotoriedad(evento.sender.id, false);
  }

  notificarSilencioCambio(microfonosEstanActivados) {
    this.sonidoVentana.webContents.send('silencioCambio');
    (
      this
      .relojes
      .forEach(
        (reloj) => {
          reloj.notificarSilencioCambio(microfonosEstanActivados);
        },
      )
    );
  }

  obtenerConfiguracion() {
    return this.configuracion;
  }

  registrarAtajoGlobal(menuElemento) {
    if (!menuElemento.accelerator || !menuElemento.click) {
      return;
    }
    const { globalShortcut } = require('electron');
    return (
      globalShortcut
      .register(menuElemento.accelerator, menuElemento.click)
    );
  }

  reubicar() {
    this.relojes.forEach((reloj) => {reloj.reubicar(this.configuracion);});
  }

}

module.exports = new ReloJito();
