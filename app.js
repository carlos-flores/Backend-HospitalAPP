// Librerias
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Importaciones
var appRoutes = require('./routes/app-route');
var userRoutes = require('./routes/usuario-routes');
var loginRoutes = require('./routes/login-routes');

// inicialización de variables
var app = express();

// BodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


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
app.use('/usuario', userRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchas peticiones
app.listen(3000, () => {
    console.log('Express server inicializado!!!');
});