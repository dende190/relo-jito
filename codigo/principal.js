'use strict';
const { app } = require('electron');

const CONFIGURACION = require('./configuracion.js');
const PLATAFORMA = require('./plataformas/' + process.platform + '.js');
const FUENTE = (
  require('./fuentes/' + CONFIGURACION.TEXTO.FUENTE.replace(/ /g, '_') + '.js')
);

const CARACTERES_CANTIDAD = 8;

let microfonosEstanActivados;
let sonidoVentana;
const relojesVentanas = [];

app.whenReady().then(inicializar);

function abrirConfiguracionVentana() {
  const { BrowserWindow } = require('electron');
  const path = require('path');
  const configuracionVentanaDatos = {
    webPreferences: {
      preload: path.join(__dirname, 'ventanas/configuracion/precarga.js'),
    },
  };
  const configuracionVentana = new BrowserWindow(configuracionVentanaDatos);
  configuracionVentana.removeMenu();
  (
    configuracionVentana
    .loadFile(path.join(__dirname, 'ventanas/configuracion/configuracion.html'))
  );
}

function ajustarRelojVentanaLimites(relojVentana, configuracion) {
  if (!isNaN(configuracion)) {
    configuracion = this;
  }
  const ventana = {
    alturaPixeles: (
      Math.ceil(
        configuracion.TEXTO.TAMANO_PIXELES *
        FUENTE.CARACTER_FACTORES.ALTURA
      )
    ),
    anchuraPixeles: (
      CARACTERES_CANTIDAD *
      Math.ceil(
        configuracion.TEXTO.TAMANO_PIXELES *
        FUENTE.CARACTER_FACTORES.ANCHURA
      )
    ),
  };
  const pantalla = relojVentana.pantalla;
  const pantallaLimites = pantalla.bounds;
  const relojVentanaLimites = {
    height: ventana.alturaPixeles,
    width: ventana.anchuraPixeles,
    x: (pantallaLimites.x + configuracion.MARGEN_PIXELES),
    y: (
      pantalla.workAreaSize.height -
      ventana.alturaPixeles +
      pantallaLimites.y
    ),
  };
  relojVentana.setBounds(relojVentanaLimites);
}

function ajustarRelojesVentanas() {
  relojesVentanas.forEach(ajustarRelojVentanaLimites, CONFIGURACION);
  relojesVentanas.forEach(ponerRelojVentanaArribaDeLasDemas);
}

function alternarMicrofonosSilencio() {
  const { exec } = require('child_process');
  if (microfonosEstanActivados === undefined) {
    microfonosEstanActivados = false;
    exec(
      PLATAFORMA.MICROFONOS.SILENCIO.DESACTIVAR_COMANDO,
      notificarMicrofonosSilencioCambio
    );
    return;
  }
  exec(
    PLATAFORMA.MICROFONOS.SILENCIO.ALTERNAR_COMANDO,
    notificarMicrofonosSilencioCambio
  );
}

function alternarRelojesVentanasNotoriedad(evento) {
  const relojesVentanasIgnorables = (
    relojesVentanas
    .filter(validarRelojIgnorable)
  );
  const notorio = !!relojesVentanasIgnorables.length;
  const argumentos = {notorio: notorio, debeNotificar: true};
  relojesVentanas.forEach(cambiarRelojVentanaNotoriedad, argumentos);
}

function cerrarAplicacion() {
  if (PLATAFORMA.ES_MACOS) {
    return;
  }
  app.quit();
}

function crearRelojVentana(pantalla) {
  const { BrowserWindow } = require('electron');
  const path = require('path');
  const relojVentanaDatos = {
    focusable: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'ventanas/reloj/precarga.js'),
    },
  };
  const relojVentana = new BrowserWindow(relojVentanaDatos);
  relojVentana.pantalla = pantalla;
  relojVentana.setAlwaysOnTop(true, 'screen-saver');
  relojVentana.loadFile(path.join(__dirname, 'ventanas/reloj/reloj.html'));
  ajustarRelojVentanaLimites(relojVentana, CONFIGURACION);
  relojesVentanas.push(relojVentana);
}

function crearRelojesVentanas() {
  const { screen } = require('electron');
  screen.getAllDisplays().forEach(crearRelojVentana);
}

function crearSonidoVentana() {
  const { BrowserWindow } = require('electron');
  const path = require('path');
  const sonidoVentanaDatos = {
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'ventanas/sonido/precarga.js'),
    },
  };
  sonidoVentana = new BrowserWindow(sonidoVentanaDatos);
  sonidoVentana.removeMenu();
  sonidoVentana.loadFile(path.join(__dirname, 'ventanas/sonido/sonido.html'));
}

function cambiarRelojVentanaNotoriedad(relojVentana) {
  relojVentana.setIgnoreMouseEvents(!this.notorio);
  relojVentana.esIgnorable = !this.notorio;
  if (!this.debeNotificar) {
    return;
  }
  relojVentana.webContents.send('cambiarRelojNotoriedad', this.notorio);
}

function inicializar() {
  const { ipcMain, Menu, Tray } = require('electron');
  crearRelojesVentanas();
  crearSonidoVentana();
  setInterval(ajustarRelojesVentanas, 1000);
  ipcMain.handle('quitarEscuchadoresParaRaton', quitarEscuchadoresParaRaton);
  ipcMain.handle('notificarConfiguracionCambio', notificarConfiguracionCambio);

  const notificacionIcono = new Tray(PLATAFORMA.ICONO);
  notificacionIcono.setToolTip('Relo-Jito');

  const menuElementos = [
    {
      click: abrirConfiguracionVentana,
      label: 'Configurar...',
      type: 'normal',
    },
    {type: 'separator'},
    {
      accelerator: (
        CONFIGURACION
        .ATAJOS_COMBINACIONES
        .VENTANAS_ALTERNAR_NOTORIEDAD
      ),
      click: alternarRelojesVentanasNotoriedad,
      label: 'Alternar notoriedad de ventanas',
      type: 'normal',
      registerAccelerator: false,
    },
    {
      accelerator: (
        CONFIGURACION
        .ATAJOS_COMBINACIONES
        .MICROFONOS_ALTERNAR_SILENCIO
      ),
      click: alternarMicrofonosSilencio,
      label: 'Alternar silencio de micrófonos',
      type: 'normal',
      registerAccelerator: false,
    },
    {type: 'separator'},
    {
      click: cerrarAplicacion,
      label: 'Cerrar',
      type: 'normal',
    },
  ];
  const menu = Menu.buildFromTemplate(menuElementos);
  notificacionIcono.setContextMenu(menu);
  notificacionIcono.on('click', alternarRelojesVentanasNotoriedad);
  menuElementos.forEach(registrarAtajoGlobal);

  alternarMicrofonosSilencio();

  app.on('window-all-closed', cerrarAplicacion);
}

function notificarConfiguracionCambio(evento, configuracion) {
  (
    relojesVentanas
    .forEach(notificarConfiguracionCambioARelojVentana, configuracion)
  );
}

function notificarConfiguracionCambioARelojVentana(relojVentana) {
  ajustarRelojVentanaLimites(relojVentana, this);
  relojVentana.webContents.send('ajustarConfiguracion', this);
}

function notificarMicrofonosEstado(relojVentana) {
  relojVentana.webContents.send('notificarMicrofonosEstado', this);
}

function notificarMicrofonosSilencioCambio(error, stdout, stderr) {
  if (error) {
    // TODO: Informar el error
    return;
  }
  if (stderr) {
    // TODO: Informar el error
    return;
  }
  microfonosEstanActivados = !microfonosEstanActivados;
  sonidoVentana.webContents.send('notificarMicrofonosEstado');
  relojesVentanas.forEach(notificarMicrofonosEstado, microfonosEstanActivados);
}

function ponerRelojVentanaArribaDeLasDemas(relojVentana) {
  relojVentana.setAlwaysOnTop(true, 'screen-saver');
}

function quitarEscuchadoresParaRaton(evento) {
  const relojVentana = (
    relojesVentanas
    .find(validarRelojVentanaId, evento.sender.id)
  );
  const argumentos = {notorio: false, debeNotificar: false};
  cambiarRelojVentanaNotoriedad.bind(argumentos)(relojVentana);
}

function registrarAtajoGlobal(menuElemento) {
  if (!menuElemento.accelerator || !menuElemento.click) {
    return;
  }
  const { globalShortcut } = require('electron');
  return globalShortcut.register(menuElemento.accelerator, menuElemento.click);
}

function validarRelojIgnorable(relojVentana) {
  return relojVentana.esIgnorable;
}

function validarRelojVentanaId(relojVentana) {
  return (relojVentana.id === this);
}
