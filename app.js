// Librerias
var express = require('express');
var mongoose = require('mongoose');


// inicialización de variables
var app = express();

// Conexion DATABASE
//mongoose.connect('mongodb://localhost:27017/hospitalDB');
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) {
        throw err;
    } else {
        console.log('Base de datos HospitalDB lista...');
    }
});

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        status: 'ok',
        code: 200,
        mensaje: 'todo ha salido excelente...'
    });
})

// Escuchas peticiones
app.listen(3000, () => {
    console.log('Express server inicializado!!!');
});