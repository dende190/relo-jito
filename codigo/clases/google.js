const CITA_CARACTERES_MAXIMOS = 20;
const CITAS_SOLICITADAS_CANTIDAD = 10;
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

class Google {

  #cliente;
  #autenticacionEnlaces;
  #clienteCredencialesRuta;
  #credencialesRuta;
  #autorizacionTipo;
  #usuarioAutenticadoId;

  constructor() {
    this.autenticacionEnlaces = [
      'https://www.googleapis.com/auth/calendar.readonly',
    ];
    this.clienteCredencialesRuta = (
      path
      .join(process.cwd(), 'credenciales_google/token.json')
    );
    this.credencialesRuta = (
      path
      .join(process.cwd(), 'credenciales_google/credenciales_google.json')
    );

    //TODO: Poder configurar esto en la configuracion
    this.usuarioAutenticadoId = 1; //AUTH de google
  }

  inicializar = async () => {
    await this.crearCliente();
  }

  crearCliente = async () => {
    if (this.cliente) {
      return;
    }

    const cliente = await (
      authenticate(
        {
          scopes: this.autenticacionEnlaces,
          keyfilePath: this.credencialesRuta,
        }
      )
    );

    this.cliente = cliente;
  }

  obtenerProximaCita = async () => {
    const cliente = this.cliente;
    if (!cliente) {
      return [];
    }

    const calendario = google.calendar({version: 'v3', auth: cliente});
    if (!calendario) {
      return [];
    }

    const calendarioRespuesta = await calendario.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: CITAS_SOLICITADAS_CANTIDAD,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const citas = calendarioRespuesta.data.items;
    if (!citas || !citas.length) {
      return [];
    }

    const citasVisibles = [];
    for (const cita of citas) {
      if (cita.start?.date) {
        continue;
      }

      const citaTitulo = cita.summary;
      const citaEnlace = cita.hangoutLink;
      (
        citasVisibles
        .unshift(
          {
            id: cita.id,
            titulo: (
              (citaTitulo.length > CITA_CARACTERES_MAXIMOS) ?
              (citaTitulo.substr(0, CITA_CARACTERES_MAXIMOS) + '...') :
              citaTitulo
            ),
            enlace: (
              citaEnlace ?
              (citaEnlace + '?authuser=' + this.usuarioAutenticadoId) :
              ''
            ),
            fechaInicio: cita.start.dateTime,
            fechaFin: cita.end.dateTime,
          },
        )
      );
    }

    return citasVisibles;
  }

};

module.exports = new Google();
