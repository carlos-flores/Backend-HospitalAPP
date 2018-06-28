/*jshint esversion: 6 */

var express = require('express');
var mongoose = require('mongoose');

const path = require('path');
const fs = require('fs');


// inicialización de variables
var app = express();
app.get('/:modelo/:imagen', (req, res) => {
    // Parametros
    var modelo = req.params.modelo;
    var imagen = req.params.imagen;

    // Se crea ruta base hacia imagenes
    var pathImagen = path.resolve(__dirname, `../uploads/${modelo}/${imagen}`);

    //Se evalua si existe la imagen
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, `../assets/no-image.png`);
        res.sendFile(pathNoImagen);
    }


});

module.exports = app;