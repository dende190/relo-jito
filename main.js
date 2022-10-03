const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const os = require('os');
const path = require('path');

const TEXTO_TAMANO = 48;
const MARGEN = 8;
const CARACTERES_CANTIDAD = 8;
// TODO: Determinar si hay un número más correcto para los menores tamaños de
// ALTURA y ANCHURA
const ALTURA = (TEXTO_TAMANO + 6);
const ANCHURA = (CARACTERES_CANTIDAD * 29);

let relojesVentanas = [];

let createWindow = () => {
  let { screen } = require('electron');
  screen.getAllDisplays().forEach((pantalla) => {
    let limites = pantalla.bounds;
    let relojVentana = new BrowserWindow({
      x: (limites.x + MARGEN),
      y: (
        limites.height -
        (limites.height - pantalla.workAreaSize.height + ALTURA) +
        limites.y
      ),
      height: ALTURA,
      width: ANCHURA,
      transparent: true,
      frame: false,
      focusable: false,
      skipTaskbar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    });
    relojVentana.setAlwaysOnTop(true, 'screen-saver');
    relojVentana.loadFile('src/index.html');
    relojesVentanas.push(relojVentana);
  });
  setInterval(ponerVentanasArribaDeLasDemas, 1000);
  ipcMain.handle('quitarEscuchadoresDeRaton', (evento) => {
    let eventoRelojVentanaId = evento.sender.id;
    let relojVentana = (
      relojesVentanas
      .find(
        (relojVentana) => {
          return (eventoRelojVentanaId === relojVentana.id);
        },
      )
    );
    relojVentana.setIgnoreMouseEvents(true);
  });
};

let ponerVentanasArribaDeLasDemas = () => {
  relojesVentanas
  .forEach(
    (ventana) => {
      ventana.setAlwaysOnTop(true, 'screen-saver');
    },
  );
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

let notificacionIcono = null;
app.whenReady().then(() => {
  createWindow();
  let iconoExtension = '.ico';
  if (os.platform() === 'linux') {
    iconoExtension = '.png';
  }

  notificacionIcono = new Tray('reloj' + iconoExtension);
  notificacionIcono.setToolTip('Cambiar opacidad');
  notificacionIcono.on('click', () => {
    relojesVentanas.forEach((relojVentana) => {
      relojVentana.setIgnoreMouseEvents(false);
      relojVentana.webContents.send('hacerRelojOpaco');
    });
  });
});
