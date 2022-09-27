let { app, BrowserWindow } = require('electron')
let path = require('path')

const TEXTO_TAMANO = 48;
const MARGEN = 8;
const ALTURA = (TEXTO_TAMANO + MARGEN);
const CARACTERES_CANTIDAD = 8;

let createWindow = () => {
  let { screen } = require('electron')
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
      width: (TEXTO_TAMANO * CARACTERES_CANTIDAD),
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    win.loadFile('src/index.html')
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
