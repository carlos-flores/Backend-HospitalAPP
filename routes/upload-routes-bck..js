/*jshint esversion: 6 */

var express = require('express');
var mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var fs = require('fs');



// inicialización de variables
var app = express();
app.use(fileUpload());

app.put('/:modelo/:id_usuario', (req, res) => {
    if (!req.files) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            mensaje: 'NO existen archivos por subir'
        });

    }




    // Obtener nombre de la imagen
    let imagen = req.files.imagen;
    let partesNombreImagen = imagen.name.split('.');
    let extensionArchivo = partesNombreImagen[partesNombreImagen.length - 1];

    //validación de extensiones
    let extensiones = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensiones.indexOf(extensionArchivo) < 0) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            mensaje: 'Extensión invalida',
            errors: { message: 'las extensiones solo pueden ser ' + extensiones.join('|') }
        });
    }

    var modelo = req.params.modelo;
    var idUsuario = req.params.id_usuario;

    var modelosValidos = ['usuarios', 'medicos', 'hospitales'];
    if (modelosValidos.indexOf(modelo) < 0) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            mensaje: 'Modelo invalido',
            errors: { message: 'las modelos solo pueden ser ' + modelosValidos.join('|') }
        });

    }

    let nombreArchivo = `${idUsuario}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    let path = './uploads/' + modelo + '/' + nombreArchivo;

    // Use the mv() method to place the file somewhere on your server
    imagen.mv(path, function(err) {
        if (err) {
            return res.status(500).json({
                status: 'error',
                code: 500,
                mensaje: 'Modelo invalido',
                errors: err
            });
        } else {
            subirPorTipo(modelo, idUsuario, nombreArchivo, res);

        }

    });




});

function subirPorTipo(modelo, idUsuario, nombreArchivo, res) {
    switch (modelo) {
        case 'usuarios':
            Usuario.findById(idUsuario, (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        status: 'error',
                        code: 500,
                        mensaje: 'Error al obtener usuario',
                        errors: err
                    });
                } else {
                    var pathViejo = './uploads/usuarios/' + usuario.img;

                    // Se revisa que existiera una imagen previa asignada al usuario
                    if (fs.existsSync(pathViejo)) {
                        // Se elimina la imagen
                        fs.unlink(pathViejo, (err) => {
                            if (err) {
                                return res.status(500).json({
                                    status: 'error',
                                    code: 500,
                                    mensaje: 'Error al eliminar imagen del usuario',
                                    errors: err
                                });
                            }
                        });
                    }

                    // Se actualiza el nombre de la imagen en la BD
                    usuario.img = nombreArchivo;
                    usuario.save((err, usuarioActualizado) => {
                        if (err) {
                            return res.status(500).json({
                                status: 'error',
                                code: 500,
                                mensaje: 'Error al actualizar imagen del usuario',
                                errors: err
                            });
                        } else {
                            return res.status(200).json({
                                status: 'ok',
                                code: 200,
                                mensaje: 'Archivo subido correctamente!!!',
                                usuarioActualizado: usuarioActualizado
                            });
                        }
                    });
                }
            });
            break;
        case 'medicos':
            break;
        case 'hospitales':
            break;
    }

}

module.exports = app;