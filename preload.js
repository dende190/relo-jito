// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
let { ipcRenderer } = require('electron')

const OPACIDADES = ['0.8', '0.1'];
let hacerRelojTransparente = () => {
  ipcRenderer.invoke('quitarEscuchadoresDeRaton');
  actualizarRelojOpacidad(1);
}
let actualizarRelojOpacidad = (opacidadIndice) => {
  let horaEstilos = document.querySelector('.hora').style;
  horaEstilos.opacity = OPACIDADES[opacidadIndice];
};
ipcRenderer.on('hacerRelojOpaco', () => {
  actualizarRelojOpacidad(0);
});
ipcRenderer.on('hacerRelojTransparente', hacerRelojTransparente);
ipcRenderer.on('ponerFondoRojo', () => {
  let dHora = document.querySelector('.hora');
  dHora.style.backgroundColor = 'pink';
});
ipcRenderer.on('quitarFondoRojo', () => {
  let dHora = document.querySelector('.hora');
  dHora.style.backgroundColor = '';
});
window.addEventListener('DOMContentLoaded', () => {
  let dHora = document.querySelector('.hora');
  dHora.addEventListener('click', hacerRelojTransparente);
});
