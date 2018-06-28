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

app.put('/:modelo/:id', (req, res) => {
    var modelo = req.params.modelo;
    var id = req.params.id;
    var modelosValidos = ['usuarios', 'medicos', 'hospitales'];

    // Se evalua que el modelo recibido sea un modelo válido
    if (modelosValidos.indexOf(modelo) < 0) {
        return res.status(500).json({
            status: 'error',
            code: 500,
            mensaje: 'Modelo invalido',
            errors: { message: 'las modelos solo pueden ser ' + modelosValidos.join('|') }
        });

    } else {
        switch (modelo) {
            case 'usuarios':
                Usuario.findById(id, (err, usuario) => {
                    return res.status(500).json({
                        status: 'error',
                        code: 500,
                        mensaje: 'Usuario inexistente',
                        errors: err
                    });
                });
                break;
            case 'medicos':
                Medico.findById(id, (err, medico) => {
                    return res.status(500).json({
                        status: 'error',
                        code: 500,
                        mensaje: 'Medico inexistente',
                        errors: err
                    });
                });
                break;
            case 'hospitales':
                Hospital.findById(id, (err, hospital) => {
                    return res.status(500).json({
                        status: 'error',
                        code: 500,
                        mensaje: 'Hospital inexistente',
                        errors: err
                    });
                });
                break;
        }
    }

    console.log('-- 1 --');
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





    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

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
            subirPorTipo(modelo, id, nombreArchivo, res);

        }

    });




});

function subirPorTipo(modelo, id, nombreArchivo, res) {
    console.log('-- 2 --');
    switch (modelo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (err) {
                    console.log('-- No se puede obtener usuario --');
                    return res.status(500).json({
                        status: 'error',
                        code: 500,
                        mensaje: 'Error al obtener usuario',
                        errors: err
                    });
                } else {
                    console.log('-- Se obtuvo usuario --');
                    var pathViejo = './uploads/usuarios/' + usuario.img;
                    console.log('-- path viejo: ' + pathViejo + ' --');
                    console.log('-- path nuevo: ' + nombreArchivo);

                    // Se revisa que existiera una imagen previa asignada al usuario
                    if (fs.existsSync(pathViejo)) {
                        // Se elimina la imagen
                        fs.unlinkSync(pathViejo, (err) => {
                            if (err) {
                                console.log('-- error al eliminar imagen anterior --');
                                return res.status(500).json({
                                    status: 'error',
                                    code: 500,
                                    mensaje: 'Error al eliminar imagen del usuario',
                                    errors: err
                                });
                            } else {
                                console.log('-- imagen borrada --');
                            }
                        });
                    }

                    // Se actualiza el nombre de la imagen en la BD
                    usuario.img = nombreArchivo;
                    usuario.save((err, usuarioActualizado) => {
                        if (err) {
                            console.log('-- error al actualizar nombre de imagen --');
                            return res.status(500).json({
                                status: 'error',
                                code: 500,
                                mensaje: 'Error al actualizar imagen del usuario',
                                errors: err
                            });
                        } else {
                            console.log('-- se actualiza nombre de imagen --');
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
            console.log('-- 3 --');
            Medico.findById(id, (err, medico) => {
                console.log('-- 4 --');
                if (err) {
                    console.log('-- 5 --');
                    return res.status(500).json({
                        status: 'error',
                        code: 500,
                        mensaje: 'Error al obtener médico',
                        errors: err
                    });
                } else {
                    console.log('-- 6 --');

                    var pathViejo = './uploads/medicos/' + medico.img;

                    console.log('-- 7 --');

                    // Se revisa que existiera una imagen previa asignada al medico
                    if (fs.existsSync(pathViejo)) {
                        console.log('-- 8 --');
                        // Se elimina la imagen
                        fs.unlink(pathViejo, (err) => {
                            if (err) {
                                console.log('-- 9 --');
                                return res.status(500).json({
                                    status: 'error',
                                    code: 500,
                                    mensaje: 'Error al eliminar imagen del médico',
                                    errors: err
                                });
                            }
                        });
                    }

                    console.log('-- 10 --');
                    // Se actualiza el nombre de la imagen en la BD
                    medico.img = nombreArchivo;
                    medico.save((err, medicoActualizado) => {
                        if (err) {
                            console.log('-- 11 --');
                            return res.status(500).json({
                                status: 'error',
                                code: 500,
                                mensaje: 'Error al actualizar imagen del médico',
                                errors: err
                            });
                        } else {
                            console.log('-- 12 --');
                            return res.status(200).json({
                                status: 'ok',
                                code: 200,
                                mensaje: 'Archivo subido correctamente!!!',
                                medicoActualizado: medicoActualizado
                            });
                        }
                    });
                }
            });
            break;
        case 'hospitales':
            break;
    }

}

module.exports = app;