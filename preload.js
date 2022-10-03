// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
let { ipcRenderer } = require('electron')

const OPACIDADES = ['0.8', '0.1'];
let hacerRelojTransparente = () => {
  ipcRenderer.invoke('quitarEscuchadoresDeRaton');
  let horaEstilos = document.querySelector('.hora').style;
  let opacidadIndice = 1;
  horaEstilos.opacity = OPACIDADES[opacidadIndice];
}

window.addEventListener('DOMContentLoaded', () => {
  let dHora = document.querySelector('.hora');
  dHora.addEventListener('click', hacerRelojTransparente);
});
