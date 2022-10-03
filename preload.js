// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
let { ipcRenderer } = require('electron')
ipcRenderer.invoke('refrescarRelojes');
