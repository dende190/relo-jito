class ReloJito {

  #configuracionClase;
  #configuracion;
  #configuracionVentana;
  #plataforma;
  #relojes;
  #sonidoVentana;
  #tiempo;
  #tiemposRegistrados;
  #tiemposRegistradosVentana;

  constructor() {
    this.configuracionClase = require('./configuracion.js');
    this.configuracion = this.configuracionClase.obtener();
    this.plataforma = require('../plataformas/' + process.platform + '.js');
    this.relojes = [];

    const { ipcMain } = require('electron');
    (
      ipcMain
      .handle(
        'crearTiempoRegistro',
        this.notificarTiempoRegistradoCreado,
      )
    );
    (
      ipcMain
      .handle(
        'configuracionCambio',
        this.notificarConfiguracionCambio,
      )
    );
    (
      ipcMain
      .handle('configuracionSolicitud', this.obtenerConfiguracion)
    );
    (
      ipcMain
      .handle('notoriedadCambio', this.notificarNotoriedadCambio)
    );
    (
      ipcMain
      .handle(
        'seleccionarTiempoRegistro',
        this.notificarTiempoRegistradoSeleccionado,
      )
    );
    (
      ipcMain
      .handle(
        'tiemposRegistradosSolicitud',
        this.obtenerTiemposRegistrados,
      )
    );
  }

  inicializar = () => {
    this.crearRelojes();
    this.inicializarSonido();
    this.tiempo = require('./tiempo.js');
    this.tiemposRegistrados = this.tiempo.obtenerRegistros();
    this.tiempo.on('cambio', this.notificarTiempoCambio);
    this.actualizarCadaSegundo();

    const microfonosEstado = require('./microfonos_estado.js');
    microfonosEstado.on('silencioCambio', this.notificarSilencioCambio);
    microfonosEstado.alternarSilencio();

    const { Menu } = require('electron');
    const menuElementos = [
      {
        click: this.abrirConfiguracion,
        label: 'Configurar...',
        type: 'normal',
      },
      {type: 'separator'},
      {
        click: this.abrirTiempoRegistros,
        label: 'Tiempos Registrados',
        type: 'normal',
      },
      {
        accelerator: (
          this
          .configuracion
          .atajos_combinaciones
          .tiempo_registrado_alternar_estado
        ),
        click: this.alternarTiempoRegistrado,
        label: 'Alternar Estado Tiempo Registrado',
        type: 'normal',
        registerAccelerator: false,
      },
      {type: 'separator'},
      {
        accelerator: (
          this
          .configuracion
          .atajos_combinaciones
          .ventanas_alternar_notoriedad
        ),
        click: this.alternarNotoriedad,
        label: 'Alternar notoriedad de ventanas',
        type: 'normal',
        registerAccelerator: false,
      },
      {
        accelerator: (
          this
          .configuracion
          .atajos_combinaciones
          .microfono_alternar_silencio
        ),
        click: microfonosEstado.alternarSilencio,
        label: 'Alternar silencio de micrófonos',
        type: 'normal',
        registerAccelerator: false,
      },
      {type: 'separator'},
      {
        click: this.cerrarAplicacion,
        label: 'Cerrar',
        type: 'normal',
      },
    ];
    const menu = Menu.buildFromTemplate(menuElementos);

    const { Tray } = require('electron');
    const notificacionIcono = new Tray(this.plataforma.ICONO);
    notificacionIcono.setToolTip('Relo-Jito');
    notificacionIcono.setContextMenu(menu);
    notificacionIcono.on('click', this.alternarNotoriedad);

    menuElementos.forEach(this.registrarAtajoGlobal);

    const { app } = require('electron');
    app.on('window-all-closed', this.cerrarAplicacion);
  }

  inicializarSonido = () => {
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

  cerrarConfiguracion = () => {
    delete this.configuracionVentana;
  }

  abrirConfiguracion = () => {
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
    this.configuracionVentana.on('closed', this.cerrarConfiguracion);
    this.configuracionVentana.removeMenu();
    this.configuracionVentana.loadFile(rutaBase + 'configuracion.html');
  }

  cerrarTiemposRegistrados = () => {
    delete this.tiemposRegistradosVentana;
  }

  abrirTiempoRegistros = () => {
    if (this.tiemposRegistradosVentana) {
      return;
    }
    const path = require('path');
    const rutaBase = path.join(__dirname, '../ventanas/tiempos_registrados/');
    const ventanaDatos = {
      webPreferences: {
        preload: (rutaBase + 'tiempos_registrados_precarga.js'),
      },
    };
    const { BrowserWindow } = require('electron');
    this.tiemposRegistradosVentana = new BrowserWindow(ventanaDatos);
    (
      this
      .tiemposRegistradosVentana
      .on('closed', this.cerrarTiemposRegistrados)
    );
    this.tiemposRegistradosVentana.removeMenu();
    (
      this
      .tiemposRegistradosVentana
      .loadFile(rutaBase + 'tiempos_registrados.html')
    );
  }

    this.relojes.forEach((reloj) => {reloj.reubicar(this.configuracion);});
  actualizarCadaSegundo = () => {
    this.tiempo.actualizar();
    setTimeout(this.actualizarCadaSegundo, 1000);
  }

  alternarNotoriedad = () => {
    const relojIgnorado = (
      this
      .relojes
      .find((reloj) => {return !reloj.esNotorio;})
    );
    const notorio = !!relojIgnorado;
    this.relojes.forEach((reloj) => {reloj.cambiarNotoriedad(notorio)});
  }

  alternarTiempoRegistrado = () => {
    this.tiempo.alternarEstadoRegistro();
  }

  cambiarNotoriedad = (relojId, notorio) => {
    const reloj = (
      this
      .relojes
      .find((reloj) => {return (reloj.obtenerId() === relojId);})
    );
    reloj.cambiarNotoriedad(notorio);
  }

  notificarNotoriedadCambio = (evento) => {
    this.cambiarNotoriedad(evento.sender.id, false);
  }

  cerrarAplicacion = () => {
    if (this.plataforma.ES_MACOS) {
      return;
    }
    const { app } = require('electron');
    app.quit();
  }

  crearReloj = (pantalla) => {
    const Reloj = require('./reloj.js');
    this.relojes.push(new Reloj(pantalla));
  }

  crearRelojes = () => {
    const { screen } = require('electron');
    screen.getAllDisplays().forEach(this.crearReloj);
  }

  notificarConfiguracionCambio = (evento, configuracionNueva) => {
    this.configuracion = this.configuracionClase.actualizar(configuracionNueva);
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

  notificarSilencioCambio = (microfonosEstanActivados) => {
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

  notificarTiempoCambio = (tiempoEnHorasMinutosYSegundos) => {
    (
      this
      .relojes
      .forEach(
        (reloj) => {
          reloj.notificarTiempoCambio(tiempoEnHorasMinutosYSegundos);
        },
      )
    );
    if (['10:30:00', '15:30:00'].includes(tiempoEnHorasMinutosYSegundos)) {
      this.sonidoVentana.webContents.send('alarmaIniciada');
    } else if (
      ['10:30:05', '15:30:05']
      .includes(tiempoEnHorasMinutosYSegundos)
    ) {
      this.sonidoVentana.webContents.send('alarmaDetenida');
    }
    let tiempoEnMinutosYSegundos = (
      tiempoEnHorasMinutosYSegundos
      .split(':')
      .splice(1)
      .join(':')
    );
    if (
      ['59:30', '14:30', '29:30', '45:30']
      .includes(tiempoEnMinutosYSegundos)
    ) {
      this.sonidoVentana.webContents.send('recordatorio');
    }
    let ultimoDigito = tiempoEnHorasMinutosYSegundos.slice(-1);
    this.sonidoVentana.webContents.send((ultimoDigito % 2) ? 'tic' : 'toc');
  }

  notificarTiempoRegistradoCreado = (evento, nombre) => {
    this.tiempo.crearRegistro(nombre);
  }

  notificarTiempoRegistradoSeleccionado = (evento, tiempoRegistroIdentificador) => {
    this.tiempo.seleccionarRegistro(tiempoRegistroIdentificador);
  }

  obtenerConfiguracion = () => {
    return this.configuracion;
  }

  obtenerTiemposRegistrados = () => {
    return this.tiemposRegistrados;
  }

  registrarAtajoGlobal = (menuElemento) => {
    if (!menuElemento.accelerator || !menuElemento.click) {
      return;
    }
    const { globalShortcut } = require('electron');
    return (
      globalShortcut
      .register(menuElemento.accelerator, menuElemento.click)
    );
  }

}

module.exports = new ReloJito();
