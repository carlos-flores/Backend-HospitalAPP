/*jshint esversion: 6 */

var express = require('express');
var mongoose = require('mongoose');


// inicialización de variables
var app = express();
var Medico = require('../models/medico');
var mdAU = require('../middleware/autenticacion');


//--------------------------------------
// Obtener todos los Medicos
//--------------------------------------
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    var tam = req.query.tam || 0;
    desde = Number(desde);
    tam = Number(tam);

    Medico.find({})
        .populate('usuario', 'nombre apellidos email')
        .populate('hospital')
        .skip(desde)
        .limit(tam)
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    code: 500,
                    mensaje: 'Error al cargar médicos...',
                    errors: err
                });
            } else {
                Medico.count({}, (err, totalRegistros) => {
                    return res.status(200).json({
                        status: 'ok',
                        code: 200,
                        mensaje: 'Se han obtenido ' + medicos.length + '/' + totalRegistros + ' médicos',
                        medicos: medicos,
                        total: totalRegistros
                    });
                });

            }
        });

});

//----------------------------------------
// Crear un Médico
//----------------------------------------
app.post('/', mdAU.verificaToken, (req, res, next) => {
    var body = req.body;

    var med = new Medico({
        nombre: body.nombre,
        apellidos: body.apellidos,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    med.save((err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 400,
                mensaje: 'Error al registrar un médico',
                errors: err
            });
        } else {
            res.status(200).json({
                status: 'ok',
                code: 201,
                mensaje: 'Se ha registrado un médico',
                medico: medicoGuardado,
                usuarioToken: req.usuario
            });
        }
    });
});

//---------------------------------------------------
//  Actualizar Médico
//---------------------------------------------------
app.put('/:id', mdAU.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 500,
                mensaje: 'Error al buscar un medico',
                errors: err
            });
        } else if (!medico) {
            res.status(400).json({
                status: 'ok',
                code: 400,
                mensaje: 'El Médico con el ID ' + id + ' no existe'
            });
        } else {

            medico.nombre = body.nombre;
            medico.apellidos = body.apellidos;
            medico.hospital = body.hospital;

            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(400).json({
                        status: 'error',
                        code: 400,
                        mensaje: 'Error al actualizar el médico con el ID ' + id,
                        errors: err
                    });
                } else {
                    res.status(200).json({
                        status: 'ok',
                        code: 201,
                        mensaje: 'Se ha actualizado el médico con el ID ' + id,
                        medico: medicoActualizado
                    });
                }
            });

        }
    });

});

//--------------------------------------
// Eliminar Médico
//--------------------------------------
app.delete('/:id', mdAU.verificaToken, (req, res, next) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 500,
                mensaje: 'Error al borrar un médico...',
                errors: err
            });
        } else if (!medicoBorrado) {
            return res.status(400).json({
                status: 'error',
                code: 500,
                mensaje: 'NO existe un médico con ese ID...',
                errors: { message: 'NO existe un médico con ese ID...' }
            });
        } else {
            res.status(200).json({
                status: 'ok',
                code: 200,
                mensaje: 'Se ha borrado el médico',
                medico: medicoBorrado
            });
        }
    })

});


module.exports = app;