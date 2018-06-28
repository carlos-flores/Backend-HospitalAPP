/*jshint esversion: 6 */

var express = require('express');
var mongoose = require('mongoose');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// inicialización de variables
var app = express();

app.get('/todo/:cadena', (req, res) => {
    var busqueda = req.params.cadena;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        res.status(200).json({
            status: 'ok',
            code: 200,
            mensaje: 'todo ha salido excelente...',
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });


});

app.get('/colleccion/:modelo/:cadena', (req, res) => {
    var modelo = req.params.modelo;
    var cadena = req.params.cadena;
    var regex = new RegExp(cadena, 'i');
    var promise;

    switch (modelo) {
        case 'usuario':
            promise = buscarUsuarios(cadena, regex);

            break;
        case 'medico':
            promise = buscarMedicos(cadena, regex);
            break;
        case 'hospital':
            promise = buscarHospitales(cadena, regex);
            break;
        default:
            return res.status(400).json({
                status: 'error',
                code: 400,
                mensaje: 'Catálogo de busqueda incorrecto (usuario,medico,hospital)'
            });

    }
    promise.then(respuesta => {
        res.status(200).json({
            status: 'ok',
            code: 200,
            mensaje: 'todo ha salido excelente...',
            [modelo]: respuesta
        });
    });



});

function buscarHospitales(cadena, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre, apellidos, email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(cadena, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex }, (err, medicos) => {
            if (err) {
                reject('Error al cargar médicos', err);
            } else {
                resolve(medicos);
            }
        });
    });
}


function buscarUsuarios(cadena, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, '-password')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}
module.exports = app;