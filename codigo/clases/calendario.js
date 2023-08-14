class Calendario {

  inicializar = () => {
    const { BrowserWindow } = require('electron')
    const calendarioVentana = (
      new BrowserWindow(
        {
          frame: false,
          resizable: false,
          show: false,
          skipTaskbar: true,
          /*
          // TODO: Ejecutar JavaScript con precarga
          webPreferences: {
            preload: (rutaBase + 'calendario_precarga.js'),
          },
          */
        },
      )
    );
    (
      calendarioVentana
      .once(
        'ready-to-show',
        () => {
          calendarioVentana.maximize();
          // TODO: Validar si la ventana no tiene el calendario, antes de
          // mostrarla
          calendarioVentana.show();
          calendarioVentana.setSkipTaskbar(false);
          console.log('Cargada');
          (
            calendarioVentana
            .webContents
            .executeJavaScript(
              `document.querySelectorAll('[data-g-action="sign in my account"]').length`,
              true,
            )
            .then(
              (inicioSesionBotonesCantidad) => {
                console.log('Melos');
                if (inicioSesionBotonesCantidad) {
                  return;
                }
                // TODO: Mover a un lugar más lindo xD
                calendarioVentana.hide();
              },
            )
          );
        },
      )
    );
    calendarioVentana.loadURL('https://calendar.google.com/calendar/r/week');
    (
      calendarioVentana
      .webContents
      .on(
        'did-finish-load',
        () => {
        },
      )
    );
  }

};

module.exports = new Calendario();
