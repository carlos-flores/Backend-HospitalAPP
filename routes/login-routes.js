/*jshint esversion: 6 */

var express = require('express');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


// inicialización de variables
var app = express();
var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

// GOOGLE
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);



//----------------------------------------
// Autenticación GOOGLE
//----------------------------------------
async function verify(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        // const userid = payload['sub'];
        // If request specified a G Suite domain:
        //const domain = payload['hd'];
        console.log(payload);
        return {
            nombre: payload.given_name,
            apellidos: payload.family_name,
            email: payload.email,
            img: payload.picture,
            google: true
        };
    } catch (error) {
        return error;
    }

}

app.post('/google', async(req, res, next) => {
    try {
        var token = req.body.token;

        var googleUser = await verify(token)
            .catch(e => {
                return res.status(403).json({
                    status: 'error',
                    code: 403,
                    mensaje: 'Token no valido'
                });
            });

        Usuario.findOne({ email: googleUser.email }, (err, usuarioRegistrado) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    code: 500,
                    mensaje: 'Error al buscar usuario',
                    error: err
                });
            } else if (!usuarioRegistrado) {
                // El usuario no existe, hay que crearlo
                let usuario = new Usuario();
                usuario.nombre = googleUser.nombre;
                usuario.apellidos = googleUser.apellidos;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = googleUser.google;
                usuario.password = ":)";

                usuario.save((err, usuarioGuardado) => {
                    if (err) {
                        return res.status(500).json({
                            status: 'error',
                            code: 400,
                            mensaje: 'Error al registrar un usuario desde google',
                            errors: err
                        });
                    } else {
                        var token = jwt.sign({ usuario: usuarioGuardado }, SEED, { expiresIn: 14400 });
                        res.status(200).json({
                            status: 'ok',
                            code: 200,
                            mensaje: 'Usuario Creado y Login Correcto',
                            usuario: usuarioGuardado,
                            id: usuarioGuardado._id,
                            token,
                            menu: obtenerMenu(usuarioGuardado.role)
                        });
                    }
                });
            } else {

                if (usuarioRegistrado.google === false) {
                    return res.status(400).json({
                        status: 'error',
                        code: 400,
                        mensaje: 'Usuario NO se puede autenticar por medio de google'
                    });
                } else {
                    usuarioRegistrado.password = '.I.';
                    var token = jwt.sign({ usuario: usuarioRegistrado }, SEED, { expiresIn: 14400 });
                    res.status(200).json({
                        status: 'ok',
                        code: 200,
                        mensaje: 'Login Correcto',
                        usuario: usuarioRegistrado,
                        id: usuarioRegistrado._id,
                        token,
                        menu: obtenerMenu(usuarioRegistrado.role)
                    });
                }

            }
        });
    } catch (error) {
        return error;
    }
});


//----------------------------------------
// Autenticación Normal
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
                token,
                menu: obtenerMenu(usuarioDB.role)
            });
        }
    });
});

function obtenerMenu(ROLE) {
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [{
                    titulo: 'Dashboard',
                    url: '/dashboard'
                },
                {
                    titulo: 'ProgressBar',
                    url: '/progress'
                },
                {
                    titulo: 'Gragicas',
                    url: '/graficas1'
                },
                {
                    titulo: 'Promesas',
                    url: '/promesas'
                },
                {
                    titulo: 'RXJS',
                    url: '/rxjs'
                }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-android',
            submenu: [{
                    titulo: 'Hospitales',
                    url: '/hospitales'
                },
                {
                    titulo: 'Médicos',
                    url: '/medicos'
                }
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({
            titulo: 'Usuarios',
            url: '/usuarios'
        })
    }
    return menu;
}

module.exports = app;