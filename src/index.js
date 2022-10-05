const SEPARADOR = ':';

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
  document.body.style.backgroundColor = '';
  document.querySelector('.hora').innerText = horaEnFormatoHHmmss;
}

window.addEventListener('DOMContentLoaded', () => {
  setInterval(actualizarHora, 1000);
});
