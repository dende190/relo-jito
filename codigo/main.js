'use strict';
const { app } = require('electron');

const CONFIGURACION = require('./configuracion.js');
const PLATAFORMA = require('./plataformas/' + process.platform + '.js');
const FUENTE = (
  require('./fuentes/' + CONFIGURACION.FUENTE_NOMBRE.replace(/ /g, '_') + '.js')
);

const CARACTERES_CANTIDAD = 8;

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

function limpiarAtajoCombinacion(atajoCombinacion) {
  return (
    atajoCombinacion
    .replace('CommandOrControl', PLATAFORMA.TECLA_CONTROL)
  );
}

function crearRelojVentana(pantalla) {
  const { BrowserWindow } = require('electron');
  const path = require('path');
  let pantallaLimites = pantalla.bounds;
  let ventana = {
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
  let relojVentanaConfiguracion = {
    focusable: false,
    frame: false,
    skipTaskbar: true,
    transparent: true,
    height: ventana.alturaPixeles,
    width: ventana.anchuraPixeles,
    x: (pantallaLimites.x + CONFIGURACION.MARGEN_PIXELES),
    y: (
      pantallaLimites.height -
      (
        pantallaLimites.height -
        pantalla.workAreaSize.height +
        ventana.alturaPixeles
      ) +
      pantallaLimites.y
    ),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  };
  let relojVentana = new BrowserWindow(relojVentanaConfiguracion);
  relojVentana.setAlwaysOnTop(true, 'screen-saver');
  relojVentana.loadFile('codigo/index.html');
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
  const { ipcMain, Menu, Tray } = require('electron');
  crearRelojesVentanas();
  setInterval(ponerRelojesVentanasArribaDeLasDemas, 1000);
  ipcMain.handle('quitarEscuchadoresParaRaton', quitarEscuchadoresParaRaton);

  let notificacionIcono = new Tray(PLATAFORMA.ICONO);
  notificacionIcono.setToolTip('Relo-Jito');
  let menuElementos = [
    {
      label: 'Alternar notoriedad de ventanas',
      sublabel: (
        limpiarAtajoCombinacion(
          CONFIGURACION
          .ATAJOS_COMBINACIONES
          .VENTANAS_ALTERNAR_NOTORIEDAD
        )
      ),
      type: 'normal',
      click: alternarRelojesVentanasNotoriedad,
    },
    {
      label: 'Alternar silencio de micrófonos',
      sublabel: (
        limpiarAtajoCombinacion(
          CONFIGURACION
          .ATAJOS_COMBINACIONES
          .MICROFONOS_ALTERNAR_SILENCIO
        )
      ),
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

  let atajosARegistrar = [
    {
      combinacion: (
        CONFIGURACION
        .ATAJOS_COMBINACIONES
        .MICROFONOS_ALTERNAR_SILENCIO
      ),
      funcion: alternarMicrofonosSilencio,
    },
    {
      combinacion: (
        CONFIGURACION
        .ATAJOS_COMBINACIONES
        .VENTANAS_ALTERNAR_NOTORIEDAD
      ),
      funcion: alternarRelojesVentanasNotoriedad,
    },
  ];
  atajosARegistrar.forEach(registrarAtajos);

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

function registrarAtajos(atajo) {
  const { globalShortcut } = require('electron');
  globalShortcut.register(atajo.combinacion, atajo.funcion);
}

function validarRelojIgnorable(relojVentana) {
  return relojVentana.esIgnorable;
}

function validarRelojVentanaId(relojVentana) {
  return (relojVentana.id === this);
}
