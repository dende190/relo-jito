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

let cambiarHoraOpacidad = (evento) => {
  if (!evento.shiftKey && !evento.ctrlKey) {
    return;
  }
  let horaEstilos = document.querySelector('.hora').style;
  let opacidadIndice = 0;
  if (evento.shiftKey) {
    opacidadIndice = 1;
  }
  horaEstilos.opacity = OPACIDADES[opacidadIndice];
}

window.addEventListener('DOMContentLoaded', () => {
  setInterval(actualizarHora, 1000);
  let dHora = document.querySelector('.hora');
  dHora.addEventListener('mousemove', cambiarHoraOpacidad);
});
