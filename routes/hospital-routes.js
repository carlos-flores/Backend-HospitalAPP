/*jshint esversion: 6 */

var express = require('express');
var mongoose = require('mongoose');


// inicialización de variables
var app = express();
var Hospital = require('../models/hospital');
var mdAU = require('../middleware/autenticacion');


//--------------------------------------
// Obtener todos los hospitales
//--------------------------------------
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    var tam = req.query.tam || 0;
    desde = Number(desde);
    tam = Number(tam);

    Hospital.find({})
        .populate('usuario', 'nombre apellidos email')
        .skip(desde)
        .limit(tam)
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    code: 500,
                    mensaje: 'Error al cargar hospitales...',
                    errors: err
                });
            } else {
                Hospital.count({}, (err, totalRegistros) => {
                    return res.status(200).json({
                        status: 'ok',
                        code: 200,
                        mensaje: 'Se han obtenido ' + hospitales.length + '/' + totalRegistros + '  hospitales',
                        hospitales: hospitales,
                        total: totalRegistros
                    });
                });

            }
        });

});

//----------------------------------------
// Crear un Hospital
//----------------------------------------
app.post('/', mdAU.verificaToken, (req, res, next) => {
    var body = req.body;

    var hosp = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hosp.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 400,
                mensaje: 'Error al registrar un hospital',
                errors: err
            });
        } else {
            res.status(200).json({
                status: 'ok',
                code: 201,
                mensaje: 'Se ha registrado un hospital',
                hospital: hospitalGuardado,
                usuarioToken: req.usuario
            });
        }
    });
});

//---------------------------------------------------
//  Actualizar Hospital
//---------------------------------------------------
app.put('/:id', mdAU.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 500,
                mensaje: 'Error al buscar un hospital',
                errors: err
            });
        } else if (!hospital) {
            res.status(400).json({
                status: 'ok',
                code: 400,
                mensaje: 'El hospital con el ID ' + id + ' no existe'
            });
        } else {

            hospital.nombre = body.nombre;

            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(400).json({
                        status: 'error',
                        code: 400,
                        mensaje: 'Error al actualizar el hospital con el ID ' + id,
                        errors: err
                    });
                } else {
                    res.status(200).json({
                        status: 'ok',
                        code: 201,
                        mensaje: 'Se ha actualizado el hospital con el ID ' + id,
                        hospital: hospitalActualizado
                    });
                }
            });

        }
    });

});

//--------------------------------------
// Eliminar Hospital
//--------------------------------------
app.delete('/:id', mdAU.verificaToken, (req, res, next) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 500,
                mensaje: 'Error al borrar un hospital...',
                errors: err
            });
        } else if (!hospitalBorrado) {
            return res.status(400).json({
                status: 'error',
                code: 500,
                mensaje: 'NO existe un hospital con ese ID...',
                errors: { message: 'NO existe un hospital con ese ID...' }
            });
        } else {
            res.status(200).json({
                status: 'ok',
                code: 200,
                mensaje: 'Se ha borrado el hospital',
                hospital: hospitalBorrado
            });
        }
    })

});


module.exports = app;