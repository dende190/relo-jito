'use strict';
const SEPARADOR = ':';

inicializar();

function actualizarHora() {
  const dCuerpoEstilos = document.body.style;
  dCuerpoEstilos.backgroundColor = 'red';
  const fechaYHora = new Date();
  const hora = fechaYHora.getHours();
  const minutos = fechaYHora.getMinutes();
  const segundos = fechaYHora.getSeconds();
  const horaEnFormatoHHmmss = (
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
