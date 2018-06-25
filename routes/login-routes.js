/*jshint esversion: 6 */

var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// inicialización de variables
var app = express();
var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

//----------------------------------------
// Hacer Login
//----------------------------------------
app.post('/', (req, res) => {
    var body = req.body;



    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 400,
                mensaje: 'Error al hacer login',
                errors: err
            });
        } else if (!usuarioDB) {
            res.status(400).json({
                status: 'ok',
                code: 400,
                mensaje: 'Credenciales incorrectas - email'
            });
        } else if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                status: 'error',
                code: 400,
                mensaje: 'Credenciales incorrectas - password'
            });
        } else {
            usuarioDB.password = '.I.';
            var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
            res.status(200).json({
                status: 'ok',
                code: 200,
                mensaje: 'Login Correcto',
                usuario: usuarioDB,
                id: usuarioDB._id,
                token
            });
        }
    });
    /* var usuario = new Usuario({
        nombre: body.nombre,
        apellidos: body.apellidos,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
       
    }); */


});

module.exports = app;