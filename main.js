'use strict';
const { app } = require('electron');
const PLATAFORMA = require('./plataforma_' + process.platform + '.js');

const TEXTO_TAMANO_PIXELES = 48;
const MARGEN_PIXELES = 8;
const CARACTERES_CANTIDAD = 8;
const SOMBRA_GROSOR_PIXELES = 2;
// TODO: Determinar si hay un número más correcto para los tamaños de
// ALTURA_EXTRA_REQUERIDA_PIXELES y ANCHURA_EXTRA_REQUERIDA_PIXELES, estos
// fueron encontrados por prueba y error hasta que aparecieran barras de scroll
const ALTURA_EXTRA_REQUERIDA_PIXELES = 6;
const ANCHURA_EXTRA_REQUERIDA_PIXELES = 29;
const ALTURA_PIXELES = (TEXTO_TAMANO_PIXELES + ALTURA_EXTRA_REQUERIDA_PIXELES);
const ANCHURA_PIXELES = (CARACTERES_CANTIDAD * ANCHURA_EXTRA_REQUERIDA_PIXELES);
const ATAJO_ALTERNAR_SILENCIO_MICROFONOS = 'CommandOrControl+Shift+X';

let microfonosEstanSilenciados;
let relojesVentanas = [];

app.whenReady().then(inicializar);

function alternarMicrofonosSilencio() {
  const { exec } = require('child_process');
  if (microfonosEstanSilenciados === undefined) {
    microfonosEstanSilenciados = true;
    exec(
      PLATAFORMA.MICROFONOS.COMANDO_ACTIVAR_SONIDO,
      notificarMicrofonosSilencioCambio
    );
    return;
  }
  exec(
    PLATAFORMA.MICROFONOS.COMANDO_ALTERNAR_SILENCIO,
    notificarMicrofonosSilencioCambio
  );
}

function alternarRelojesVentanasNotoriedad(evento) {
  let relojesVentanasIgnorables = relojesVentanas.filter(validarRelojIgnorable);
  let notorio = !!relojesVentanasIgnorables.length;
  let argumentos = {notorio: notorio, debeNotificar: true};
  relojesVentanas.forEach(cambiarRelojVentanaNotoriedad, argumentos);
}

function cerrarAplicacion() {
  if (PLATAFORMA.ESTUPIDA) {
    return;
  }
  app.quit();
}

function crearRelojVentana(pantalla) {
  const { BrowserWindow } = require('electron');
  const path = require('path');
  let limites = pantalla.bounds;
  let ventanaRelojConfiguracion = {
    focusable: false,
    frame: false,
    skipTaskbar: true,
    transparent: true,
    height: ALTURA_PIXELES,
    width: ANCHURA_PIXELES,
    x: (limites.x + MARGEN_PIXELES),
    y: (
      limites.height -
      (limites.height - pantalla.workAreaSize.height + ALTURA_PIXELES) +
      limites.y
    ),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  };
  let relojVentana = new BrowserWindow(ventanaRelojConfiguracion);
  relojVentana.setAlwaysOnTop(true, 'screen-saver');
  relojVentana.loadFile('src/index.html');
  relojesVentanas.push(relojVentana);
}

function crearRelojesVentanas() {
  let { screen } = require('electron');
  screen.getAllDisplays().forEach(crearRelojVentana);
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
  const { globalShortcut, ipcMain, Menu, Tray } = require('electron');
  crearRelojesVentanas();
  setInterval(ponerRelojesVentanasArribaDeLasDemas, 1000);
  ipcMain.handle('quitarEscuchadoresParaRaton', quitarEscuchadoresParaRaton);

  let notificacionIcono = new Tray(PLATAFORMA.ICONO);
  notificacionIcono.setToolTip('Relo-Jito');
  let menuElementos = [
    {
      label: 'Alternar opacidad',
      type: 'normal',
      click: alternarRelojesVentanasNotoriedad,
    },
    {
      label: 'Alternar silencio micrófonos',
      type: 'normal',
      click: alternarMicrofonosSilencio,
    },
    {type: 'separator'},
    {
      label: 'Cerrar',
      type: 'normal',
      click: cerrarAplicacion,
    },
  ];
  let menu = Menu.buildFromTemplate(menuElementos);
  notificacionIcono.setContextMenu(menu);
  notificacionIcono.on('click', alternarRelojesVentanasNotoriedad);

  alternarMicrofonosSilencio();

  (
    globalShortcut
    .register(ATAJO_ALTERNAR_SILENCIO_MICROFONOS, alternarMicrofonosSilencio)
  );

  app.on('window-all-closed', cerrarAplicacion);
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
  microfonosEstanSilenciados = !microfonosEstanSilenciados;
  relojesVentanas.forEach(notificarMicrofonosEstado, microfonosEstanSilenciados);
}

function ponerRelojVentanaArribaDeLasDemas(relojVentana) {
  relojVentana.setAlwaysOnTop(true, 'screen-saver');
}

function ponerRelojesVentanasArribaDeLasDemas() {
  relojesVentanas.forEach(ponerRelojVentanaArribaDeLasDemas);
}

function quitarEscuchadoresParaRaton(evento) {
  let relojVentana = (
    relojesVentanas
    .find(validarRelojVentanaId, evento.sender.id)
  );
  let argumentos = {notorio: false, debeNotificar: false};
  cambiarRelojVentanaNotoriedad.bind(argumentos)(relojVentana);
}

function validarRelojIgnorable(relojVentana) {
  return relojVentana.esIgnorable;
}

function validarRelojVentanaId(relojVentana) {
  return (relojVentana.id === this);
}
