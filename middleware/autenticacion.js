/*jshint esversion: 6 */

var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

//----------------------------------------
// Verificar token
//----------------------------------------
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: 'error',
                code: 401,
                mensaje: 'Token invalido',
                errors: err
            });
        } else {
            req.usuario = decoded.usuario;
            next();
        }
    })
};

//----------------------------------------
// Verificar ADMIN
//----------------------------------------
exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            status: 'error',
            code: 401,
            mensaje: 'Token incorrecto - NO es administrador',
            errors: { message: 'NO es administrador' }
        });
    }
};

//----------------------------------------
// Verificar ADMIN o Mismo Usuario
//----------------------------------------
exports.verificaADMIN_o_MismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            status: 'error',
            code: 401,
            mensaje: 'Token incorrecto - NO es administrador ni es el mismo usuario',
            errors: { message: 'NO es administrador' }
        });
    }
};