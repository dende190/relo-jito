'use strict';
const { app } = require('electron');
const reloJito = require('./clases/relo_jito.js');

app.whenReady().then(reloJito.inicializar.bind(reloJito));
