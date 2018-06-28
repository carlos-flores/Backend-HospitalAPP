// Librerias
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Importaciones
var appRoutes = require('./routes/app-route');
var userRoutes = require('./routes/usuario-routes');
var hospitalRoutes = require('./routes/hospital-routes');
var medicoRoutes = require('./routes/medico-routes');
var loginRoutes = require('./routes/login-routes');
var busquedaRoutes = require('./routes/busqueda-routes');
var uploadRoutes = require('./routes/upload-routes');
var getImagesRoutes = require('./routes/getimages-routes');

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

// serve-index config
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));


// Rutas
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/usuario', userRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', getImagesRoutes);
app.use('/', appRoutes);

// Escuchas peticiones
app.listen(3000, () => {
    console.log('Express server inicializado!!!');
});