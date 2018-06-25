/*jshint esversion: 6 */

var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


// inicialización de variables
var app = express();
var Usuario = require('../models/usuario');
var mdAU = require('../middleware/autenticacion');


//--------------------------------------
// Obtener todos los usuarios
//--------------------------------------
app.get('/', (req, res, next) => {
    Usuario.find({}, '-password').exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 500,
                mensaje: 'Error al cargar usuarios...',
                errors: err
            });
        } else {
            res.status(200).json({
                status: 'ok',
                code: 200,
                mensaje: 'Se han obtenido usuarios...',
                usuarios: usuarios
            });
        }
    })

});


//----------------------------------------
// Crear un usuario
//----------------------------------------
app.post('/', mdAU.verificaToken, (req, res, next) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        apellidos: body.apellidos,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 400,
                mensaje: 'Error al registrar un usuario',
                errors: err
            });
        } else {
            res.status(200).json({
                status: 'ok',
                code: 201,
                mensaje: 'Se ha registrado un usuario',
                usuario: usuarioGuardado,
                usuarioToken: req.usuario
            });
        }
    });


});



//---------------------------------------------------
//  Actualizar Usuario
//---------------------------------------------------
app.put('/:id', mdAU.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, '-password', (err, usuario) => {

        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 500,
                mensaje: 'Error al buscar un usuario',
                errors: err
            });
        } else if (!usuario) {
            res.status(400).json({
                status: 'ok',
                code: 400,
                mensaje: 'El usuario con el ID ' + id + ' no existe'
            });
        } else {

            usuario.nombre = body.nombre;
            usuario.apellidos = body.apellidos;
            usuario.email = body.email;
            //usuario.password = bcrypt.hashSync(body.password, 10);
            usuario.img = body.img;
            usuario.role = body.role;

            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(400).json({
                        status: 'error',
                        code: 400,
                        mensaje: 'Error al actualizar el usuario con el ID ' + id,
                        errors: err
                    });
                } else {
                    res.status(200).json({
                        status: 'ok',
                        code: 201,
                        mensaje: 'Se ha actualizado el usuario con el ID ' + id,
                        usuario: usuarioGuardado
                    });
                }
            });

        }
    });

});

//--------------------------------------
// Eliminar usuario
//--------------------------------------
app.delete('/:id', mdAU.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 500,
                mensaje: 'Error al borrar un usuario...',
                errors: err
            });
        } else if (!usuarioBorrado) {
            return res.status(400).json({
                status: 'error',
                code: 500,
                mensaje: 'NO existe un usuario con ese ID...',
                errors: { message: 'NO existe un usuario con ese ID...' }
            });
        } else {
            res.status(200).json({
                status: 'ok',
                code: 200,
                mensaje: 'Se han borrado el usuario',
                usuario: usuarioBorrado
            });
        }
    })

});




module.exports = app;