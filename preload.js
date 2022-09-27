// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const SEPARADOR = ':';
const OPACIDADES = ['0.8', '0.1'];

let mostrarEnDosCifras = (numero) => {
  return ('0' + numero).slice(-2);
}

let actualizarHora = () => {
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
  document.querySelector('.hora').innerText = horaEnFormatoHHmmss;
}

let cambiarHoraOpacidad = () => {
  let horaEstilos = document.querySelector('.hora').style;
  let opacidadIndice = 1;
  if (horaEstilos.opacity === OPACIDADES[1]) {
    opacidadIndice = 0;
  }
  horaEstilos.opacity = OPACIDADES[opacidadIndice];
}

window.addEventListener('DOMContentLoaded', () => {
  setInterval(actualizarHora, 1000);
  document.querySelector('.hora').addEventListener('click', cambiarHoraOpacidad);
})
