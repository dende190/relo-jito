'use strict';
const SEPARADOR = ':';

inicializar();

function actualizarHora() {
  let dCuerpoEstilos = document.body.style;
  dCuerpoEstilos.backgroundColor = 'red';
  let fechaYHora = new Date();
  let hora = fechaYHora.getHours();
  let minutos = fechaYHora.getMinutes();
  let segundos = fechaYHora.getSeconds();
  let horaEnFormatoHHmmss = (
    mostrarEnDosCifras(hora) +
    SEPARADOR +
    mostrarEnDosCifras(minutos) +
    SEPARADOR +
    mostrarEnDosCifras(segundos)
  );
  dCuerpoEstilos.backgroundColor = '';
  document.querySelector('.hora').innerText = horaEnFormatoHHmmss;
}

function inicializar() {
  actualizarHora();
  setInterval(actualizarHora, 1000);
}

function mostrarEnDosCifras(numero) {
  return ('0' + numero).slice(-2);
}
