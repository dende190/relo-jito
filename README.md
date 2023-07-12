# Relo-Jito

Un proyecto que nació porque queríamos poder ver la hora con segundos en todo
momento, en todos los monitores, de manera que se pudieran tomar decisiones con
respecto a la misma

## Ejecución

1. Clonar el repositorio
2. Ejecutar `npm install`
3. Ejecutar `npm start`

## Generación de paquete

Ejecutar `npm run make`

## Generación de iconos

Gracias a https://github.com/safu9/electron-icon-builder

```console
./node_modules/.bin/electron-icon-builder --flatten --input=/ruta/absoluta/relo-jito/imagenes/logo.png --output=./
mv icons iconos
```

# Agradecimientos

En Windows, para cambiar el sonido del micrófono, se hace uso de la herramienta
SoundVolumeCommandLine v1.10
https://www.nirsoft.net/utils/sound_volume_command_line.html
