let { app, BrowserWindow } = require('electron');
let path = require('path');

const TEXTO_TAMANO = 48;
const MARGEN = 8;
const CARACTERES_CANTIDAD = 8;
// TODO: Determinar si hay un número más correcto para los menores tamaños de
// ALTURA y ANCHURA
const ALTURA = (TEXTO_TAMANO + 6);
const ANCHURA = (CARACTERES_CANTIDAD * 29);

let relojes = [];

let createWindow = () => {
  let { screen } = require('electron');
  screen.getAllDisplays().forEach((pantalla) => {
    let limites = pantalla.bounds;
    let win = new BrowserWindow({
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

    win.setAlwaysOnTop(true, 'screen-saver');
    win.setIgnoreMouseEvents(true, {forward: true});
    win.setFocusable(false);
    win.loadFile('src/index.html');
    relojes.push(win);
  });
  setInterval(ponerVentanasArribaDeLasDemas, 1000);
};

let ponerVentanasArribaDeLasDemas = () => {
  relojes
  .forEach(
    (ventana) => {
      ventana.setAlwaysOnTop(true, 'screen-saver');
    },
  );
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
});
