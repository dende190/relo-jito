/**
 * Estos factores se obtuvieron con la prueba de carga, en Chrome, del HTML:
 * <a style="border: 1px solid red; font-family: courier new; font-size: 100px;">R</a>
 * y luego midiendo la distancia entre los bordes
 * Aquí el ejemplo: https://jsfiddle.net/skfvtLxd/
 */
module.exports = {
  CARACTER_FACTORES: {
    // Un caracter de Courier New con 100 pixeles de tamaño, tiene 113 pixeles
    // de alto, así que el factor es 113%
    ALTURA: 1.13,
    // Un caracter de Courier New con 100 pixeles de tamaño, tiene 60 pixeles de
    // ancho, así que el factor es 60%
    ANCHURA: 0.6,
  },
};
