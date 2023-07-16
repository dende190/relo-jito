const CITA_CARACTERES_MAXIMOS = 20;
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

  guardarClienteCredenciales = async (client) => {
    const credenciales = await fs.readFile(this.credencialesRuta);
    const crdencialesJson = JSON.parse(credenciales);
    const credencialesLlave = (
      crdencialesJson.installed ||
      crdencialesJson.web
    );
    const clienteCredencialesJson = (
      JSON
      .stringify(
        {
          type: 'authorized_user',
          client_id: credencialesLlave.client_id,
          client_secret: credencialesLlave.client_secret,
          refresh_token: client.credentials.refresh_token,
        }
      )
    );
    await fs.writeFile(this.clienteCredencialesRuta, clienteCredencialesJson);
  }

  crearCliente = async () => {
    if (this.cliente) {
      return;
    }

    let cliente = {};
    try {
      const clienteCredenciales = await (
        fs
        .readFile(this.clienteCredencialesRuta)
      );
      const clienteCredencialesJson = JSON.parse(clienteCredenciales);
      cliente = google.auth.fromJSON(clienteCredencialesJson);
    } catch (err) {}

    if (Object.keys(cliente).length) {
      this.cliente = cliente;
      return;
    }

    cliente = await (
      authenticate(
        {
          scopes: this.autenticacionEnlaces,
          keyfilePath: this.credencialesRuta,
        }
      )
    );

    if (cliente.credentials) {
      await this.guardarClienteCredenciales(cliente);
    }

    this.cliente = cliente;
  }


  obtenerProximaCita = async () => {
    const cliente = this.cliente;
    if (!cliente) {
      return;
    }

    const calendario = google.calendar({version: 'v3', auth: cliente});
    //TODO: Traer solo un dato y no una lista
    const calendarioRespuesta = await calendario.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 1,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const citas = calendarioRespuesta.data.items;
    if (!citas || !citas.length) {
      return {};
    }

    const cita = citas[0];
    const citaTitulo = cita.summary;
    const citaEnlace = cita.hangoutLink;
    return {
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
    };
  }

};

module.exports = new Google();
