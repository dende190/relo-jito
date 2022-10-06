'use strict';
const { app } = require('electron');

const CONFIGURACION = require('./configuracion.js');
const PLATAFORMA = require('./plataforma_' + process.platform + '.js');
const FUENTE = (
  require('./fuentes/' + CONFIGURACION.FUENTE_NOMBRE.replace(/ /g, '_') + '.js')
);

const CARACTERES_CANTIDAD = 8;
const VENTANA_ALTURA_PIXELES = (
  Math.ceil(
    CONFIGURACION.TEXTO.TAMANO_PIXELES *
    FUENTE.CARACTER_FACTORES.ALTURA
  )
);
const VENTANA_ANCHURA_PIXELES = (
  CARACTERES_CANTIDAD *
  Math.ceil(
    CONFIGURACION.TEXTO.TAMANO_PIXELES *
    FUENTE.CARACTER_FACTORES.ANCHURA
  )
);

let microfonosEstanActivados;
let relojesVentanas = [];

app.whenReady().then(inicializar);

function alternarMicrofonosSilencio() {
  const { exec } = require('child_process');
  if (microfonosEstanActivados === undefined) {
    microfonosEstanActivados = false;
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
    height: VENTANA_ALTURA_PIXELES,
    width: VENTANA_ANCHURA_PIXELES,
    x: (limites.x + CONFIGURACION.MARGEN_PIXELES),
    y: (
      limites.height -
      (limites.height - pantalla.workAreaSize.height + VENTANA_ALTURA_PIXELES) +
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
    .register(
      CONFIGURACION.ATAJO_ALTERNAR_SILENCIO_MICROFONOS,
      alternarMicrofonosSilencio,
    )
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
  microfonosEstanActivados = !microfonosEstanActivados;
  relojesVentanas.forEach(notificarMicrofonosEstado, microfonosEstanActivados);
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
