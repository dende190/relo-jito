'use strict';
const { app } = require('electron');

const CONFIGURACION = require('./configuracion.js');
const PLATAFORMA = require('./plataformas/' + process.platform + '.js');
const FUENTE = (
  require('./fuentes/' + CONFIGURACION.FUENTE_NOMBRE.replace(/ /g, '_') + '.js')
);

const CARACTERES_CANTIDAD = 8;

let microfonosEstanActivados;
const relojesVentanas = [];

app.whenReady().then(inicializar);

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
  const relojesVentanasIgnorables = relojesVentanas.filter(validarRelojIgnorable);
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
  const ventana = {
    alturaPixeles: (
      Math.ceil(
        CONFIGURACION.TEXTO.TAMANO_PIXELES *
        FUENTE.CARACTER_FACTORES.ALTURA
      )
    ),
    anchuraPixeles: (
      CARACTERES_CANTIDAD *
      Math.ceil(
        CONFIGURACION.TEXTO.TAMANO_PIXELES *
        FUENTE.CARACTER_FACTORES.ANCHURA
      )
    ),
  };
  const pantallaLimites = pantalla.bounds;
  const relojVentanaConfiguracion = {
    focusable: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    transparent: true,
    height: ventana.alturaPixeles,
    width: ventana.anchuraPixeles,
    x: (pantallaLimites.x + CONFIGURACION.MARGEN_PIXELES),
    y: (
      pantalla.workAreaSize.height -
      ventana.alturaPixeles +
      pantallaLimites.y
    ),
    webPreferences: {
      preload: path.join(__dirname, 'precarga.js'),
    },
  };
  const relojVentana = new BrowserWindow(relojVentanaConfiguracion);
  relojVentana.setAlwaysOnTop(true, 'screen-saver');
  relojVentana.loadFile('codigo/reloj/reloj.html');
  relojesVentanas.push(relojVentana);
}

function crearRelojesVentanas() {
  const { screen } = require('electron');
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
  const { ipcMain, Menu, Tray } = require('electron');
  crearRelojesVentanas();
  setInterval(ponerRelojesVentanasArribaDeLasDemas, 1000);
  ipcMain.handle('quitarEscuchadoresParaRaton', quitarEscuchadoresParaRaton);

  const notificacionIcono = new Tray(PLATAFORMA.ICONO);
  notificacionIcono.setToolTip('Relo-Jito');

  const menuElementos = [
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

  alternarMicrofonosSilencio();

  const atajosGlobalesARegistrar = [
    {
      combinacion: (
        CONFIGURACION
        .ATAJOS_COMBINACIONES
        .VENTANAS_ALTERNAR_NOTORIEDAD
      ),
      funcion: alternarRelojesVentanasNotoriedad,
    },
    {
      combinacion: (
        CONFIGURACION
        .ATAJOS_COMBINACIONES
        .MICROFONOS_ALTERNAR_SILENCIO
      ),
      funcion: alternarMicrofonosSilencio,
    },
  ];
  atajosGlobalesARegistrar.forEach(registrarAtajoGlobal);

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
  const relojVentana = (
    relojesVentanas
    .find(validarRelojVentanaId, evento.sender.id)
  );
  const argumentos = {notorio: false, debeNotificar: false};
  cambiarRelojVentanaNotoriedad.bind(argumentos)(relojVentana);
}

function registrarAtajoGlobal(atajo) {
  const { globalShortcut } = require('electron');
  return globalShortcut.register(atajo.combinacion, atajo.funcion);
}

function validarRelojIgnorable(relojVentana) {
  return relojVentana.esIgnorable;
}

function validarRelojVentanaId(relojVentana) {
  return (relojVentana.id === this);
}
