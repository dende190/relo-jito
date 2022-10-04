const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Tray
} = require('electron');
const { exec } = require('child_process');
const path = require('path');

const comandosParaAlternarSilencio = {
  'linux': 'amixer set Capture toggle',
  'win32': path.join(__dirname, 'librerias/SoundVolumeCommandLine/svcl.exe') + ' /Stdout /Switch "Microphone"',
};
const comandosParaActivarSonido = {
  'linux': 'amixer set Capture cap',
  'win32': path.join(__dirname, 'librerias/SoundVolumeCommandLine/svcl.exe') + ' /Stdout /Unmute "Microphone"',
};

let microfonoEstaSilenciado;
exec(comandosParaActivarSonido[process.platform], (error, stdout, stderr) => {
  if (error) {
    // TODO: Informar el error
    return;
  }
  if (stderr) {
    // TODO: Informar el error
    return;
  }
  microfonoEstaSilenciado = false;
});

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
    relojVentana.esTransparente = true;
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
  if (process.platform !== 'darwin') {
    app.quit();
    notificacionIcono.destroy();
  }
});

let notificacionIcono = null;
app.whenReady().then(() => {
  createWindow();
  let iconoExtension = '.ico';
  if (process.platform === 'linux') {
    iconoExtension = '.png';
  }

  notificacionIcono = new Tray(path.join(__dirname, 'reloj' + iconoExtension));
  notificacionIcono.setToolTip('Cambiar opacidad');
  notificacionIcono.on('click', () => {
    let relojesTransparentes = relojesVentanas.filter((relojVentana) => {
      return relojVentana.esTransparente;
    });
    if (relojesTransparentes.length) {
      relojesTransparentes.forEach((relojVentana) => {
        relojVentana.setIgnoreMouseEvents(false);
        relojVentana.esTransparente = false;
        relojVentana.webContents.send('hacerRelojOpaco');
      });
    } else {
      relojesVentanas.forEach((relojVentana) => {
        relojVentana.webContents.send('hacerRelojTransparente');
      });
    }
  });

  globalShortcut.register('CommandOrControl+Shift+X', () => {
    exec(comandosParaAlternarSilencio[process.platform], (error, stdout, stderr) => {
      if (error) {
        // TODO: Informar el error
        return;
      }
      if (stderr) {
        // TODO: Informar el error
        return;
      }
      microfonoEstaSilenciado = !microfonoEstaSilenciado;
      relojesVentanas.forEach((relojVentana) => {
        if (microfonoEstaSilenciado) {
          relojVentana.webContents.send('ponerFondoRojo');
        } else {
          relojVentana.webContents.send('quitarFondoRojo');
        }
      });
    });
  })
});
