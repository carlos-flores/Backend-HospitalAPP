var express = require('express');
var mongoose = require('mongoose');


// inicialización de variables
var app = express();
app.get('/', (req, res, next) => {
    res.status(200).json({
        status: 'ok',
        code: 200,
        mensaje: 'todo ha salido excelente...'
    });
});

module.exports = app;