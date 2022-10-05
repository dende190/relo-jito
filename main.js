'use strict';
const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  Tray,
} = require('electron');
const { exec } = require('child_process');
const path = require('path');
const PLATAFORMA = require('./plataforma_' + process.platform + '.js');

const TEXTO_TAMANO = 48;
const MARGEN = 8;
const CARACTERES_CANTIDAD = 8;
// TODO: Determinar si hay un número más correcto para los menores tamaños de
// ALTURA y ANCHURA, estos fueron encontrados por prueba y error hasta que
// aparecieran barras de scroll
const ALTURA = (TEXTO_TAMANO + 6);
const ANCHURA = (CARACTERES_CANTIDAD * 29);
const ATAJO_ALTERNAR_SILENCIO_MICROFONOS = 'CommandOrControl+Shift+X';

let microfonosEstanSilenciados;
let relojesVentanas = [];

app.whenReady().then(inicializar);

function alternarRelojesVentanasNotoriedad(evento) {
  let relojesVentanasIgnorables = relojesVentanas.filter(validarRelojIgnorable);
  let notorio = !!relojesVentanasIgnorables.length;
  let argumentos = {notorio: notorio, debeNotificar: true};
  relojesVentanas.forEach(cambiarRelojVentanaNotoriedad, argumentos);
}

function alternarSilencioMicrofonos() {
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

function cerrarAplicacion() {
  if (PLATAFORMA.ESTUPIDA) {
    return;
  }
  app.quit();
}

function crearRelojVentana(pantalla) {
  let limites = pantalla.bounds;
  let relojVentana = new BrowserWindow({
    focusable: false,
    frame: false,
    skipTaskbar: true,
    transparent: true,
    height: ALTURA,
    width: ANCHURA,
    x: (limites.x + MARGEN),
    y: (
      limites.height -
      (limites.height - pantalla.workAreaSize.height + ALTURA) +
      limites.y
    ),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
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
  crearRelojesVentanas();
  setInterval(ponerRelojesVentanasArribaDeLasDemas, 1000);
  ipcMain.handle('quitarEscuchadoresParaRaton', quitarEscuchadoresParaRaton);
  let iconoExtension = '.ico';
  if (process.platform === 'linux') {
    iconoExtension = '.png';
  }

  let notificacionIcono = new Tray(PLATAFORMA.ICONO);
  notificacionIcono.setToolTip('Relo-Jito');
  let menuElementos = [
    {
      label: 'Alternar opacidad',
      type: 'normal',
      click: alternarRelojesVentanasNotoriedad,
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

  alternarSilencioMicrofonos();

  (
    globalShortcut
    .register(ATAJO_ALTERNAR_SILENCIO_MICROFONOS, alternarSilencioMicrofonos)
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
