const CINCO_MINUTOS_EN_MILISEGUNDOS = 300000;

class ReloJito {

  #configuracion;
  #configuracionVentana;
  #plataforma;
  #relojes;
  #sonidoVentana;
  #tiempo;
  #tiemposRegistrados;
  #tiemposRegistradosVentana;
  #red;
  #google;

  constructor() {
    this.configuracion = require('./configuracion.js');
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
      .handle('configuracionSolicitud', this.configuracion.obtener)
    );
    (
      ipcMain
      .handle('configuracionRestaurar', this.configuracion.restaurar)
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
    (
      ipcMain
      .handle(
        'alternarTiempoRegistrado',
        this.alternarTiempoRegistrado,
      )
    );
  }

  inicializar = async () => {
    this.reiniciarVentanas();
    this.google = require('./google.js');
    try {
      await this.google.inicializar();
    } catch(error) {
      (
        console
        .error(
          '\x1b[31mOcurrió un problema al inicializar Google:\x1b[0m ' +
          error
        )
      );
      this.cerrarAplicacion();
    }
    this.actualizarProximaCita();
    this.tiempo = require('./tiempo.js');
    this.tiemposRegistrados = this.tiempo.obtenerRegistros();
    this.tiempo.on('cambio', this.notificarTiempoCambio);

    this.red = require('./red.js');
    this.red.comprobarEstado();
    this.red.on('cambio', this.notificarRedEstado);

    const microfonosEstado = require('./microfonos_estado.js');
    microfonosEstado.on('silencioCambio', this.notificarSilencioCambio);
    microfonosEstado.alternarSilencio();

    const { Menu } = require('electron');
    const configuracion = this.configuracion;
    const menuElementos = [
      {
        click: this.abrirConfiguracion,
        label: 'Configurar...',
        type: 'normal',
      },
      {
        click: this.reiniciarVentanas,
        label: 'Reiniciar ventanas',
        type: 'normal',
      },
      {type: 'separator'},
      {
        click: this.abrirTiempoRegistros,
        label: 'Tiempos registrados',
        type: 'normal',
      },
      {
        accelerator: (
          configuracion
          .obtener('cronometro.atajo_para_alternar_estado')
        ),
        click: this.alternarTiempoRegistrado,
        label: 'Alternar estado cronómetro',
        type: 'normal',
        registerAccelerator: false,
      },
      {type: 'separator'},
      {
        accelerator: (
          configuracion
          .obtener('ventanas.atajo_para_alternar_notoriedad')
        ),
        click: this.alternarNotoriedad,
        label: 'Alternar notoriedad de ventanas',
        type: 'normal',
        registerAccelerator: false,
      },
      {
        accelerator: (
          configuracion
          .obtener('microfonos.atajo_para_alternar_silencio')
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
    this.configuracionVentana.webContents.openDevTools();
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

  alternarNotoriedad = () => {
    const relojIgnorado = (
      this
      .relojes
      .find((reloj) => {return !reloj.validarEsNotorio();})
    );
    const notorio = !!relojIgnorado;
    this.relojes.forEach((reloj) => {reloj.cambiarNotoriedad(notorio)});
  }

  alternarTiempoRegistrado = () => {
    this.tiempo.alternarEstadoRegistro();
    this.relojes.forEach((reloj) => {reloj.alternarTiempoRegistradoIconos()});
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
    this.reiniciarRelojes();
    const { app } = require('electron');
    app.quit();
  }

  crearReloj = (pantalla) => {
    const Reloj = require('./reloj.js');
    this.relojes.push(new Reloj(pantalla));
  }

  reiniciarRelojes = () => {
    for (let relojIndice in this.relojes) {
      this.relojes[relojIndice].cerrar();
      delete this.relojes[relojIndice];
    }
    this.relojes = [];
  }

  reiniciarVentanas = () => {
    this.reiniciarRelojes();
    this.sonidoVentana?.close();
    delete this.sonidoVentana;
    this.inicializarSonido();
    const { screen } = require('electron');
    screen.getAllDisplays().forEach(this.crearReloj);
  }

  notificarConfiguracionCambio = (evento, configuracionNueva) => {
    const configuracion = this.configuracion;
    configuracion.actualizar(configuracionNueva);
    (
      this
      .relojes
      .forEach((reloj) => {reloj.notificarConfiguracionCambio(configuracion)})
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

  actualizarProximaCita = async () => {
    const proximaCita = await this.google.obtenerProximaCita();
    if (!Object.values(proximaCita).length) {
      return;
    }

    const fechaActual = new Date().getTime();
    const proximaCitaFechaInicioTimestamp = (
      new Date(proximaCita.fechaInicio).getTime()
    );
    if (
      (proximaCitaFechaInicioTimestamp - fechaActual) >
      CINCO_MINUTOS_EN_MILISEGUNDOS
    ) {
      (
        this
        .relojes
        .forEach(
          (reloj) => {
            reloj.removerProximaCita();
            reloj.reubicar(this.configuracion);
          },
        )
      );
      return;
    }

    //TODO: Alerta un minuto antes con sonidito
    (
      this
      .relojes
      .forEach(
        (reloj) => {
          reloj.mostrarProximaCita(proximaCita);
          reloj.reubicar(this.configuracion);
        },
      )
    );
  }

  notificarTiempoCambio = (tiempoEnHorasMinutosYSegundos) => {
    const nuevoMinuto = (tiempoEnHorasMinutosYSegundos.split(':')[2] === '00');
    if (nuevoMinuto) {
      this.actualizarProximaCita();
    }
    (
      this
      .relojes
      .forEach(
        (reloj) => {
          reloj.notificarTiempoCambio(tiempoEnHorasMinutosYSegundos);
          reloj.reubicar(this.configuracion);
        },
      )
    );
    if (['10:30:00', '15:30:00'].includes(tiempoEnHorasMinutosYSegundos)) {
      // this.sonidoVentana.webContents.send('alarmaIniciada');
    } else if (
      ['10:30:05', '15:30:05']
      .includes(tiempoEnHorasMinutosYSegundos)
    ) {
      // this.sonidoVentana.webContents.send('alarmaDetenida');
    }
    let tiempoPartes = tiempoEnHorasMinutosYSegundos.split(':');
    let tiempoEnHorasYMinutos = tiempoPartes.slice(0, 2).join(':');
    let tiempoEnMinutosYSegundos = tiempoPartes.splice(1).join(':');
    if (
      ['00:00', '15:00', '30:00', '45:00']
      .includes(tiempoEnMinutosYSegundos)
    ) {
      (
        this
        .sonidoVentana
        .webContents
        .send('recordatorio', tiempoEnHorasYMinutos)
      );
    }
    let ultimoDigito = tiempoEnHorasMinutosYSegundos.slice(-1);
    // this.sonidoVentana.webContents.send((ultimoDigito % 2) ? 'tic' : 'toc');
  }

  notificarTiempoRegistradoCreado = (evento, nombre) => {
    this.tiempo.crearRegistro(nombre);
  }

  notificarTiempoRegistradoSeleccionado = (
    evento,
    tiempoRegistroIdentificador
  ) => {
    this.tiempo.seleccionarRegistro(tiempoRegistroIdentificador);
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

  notificarRedEstado = (tiempoMilisegundos) => {
    (
      this
      .relojes
      .forEach((reloj) => {reloj.actualizarRedEstado(tiempoMilisegundos)})
    );
  }

}

module.exports = new ReloJito();
