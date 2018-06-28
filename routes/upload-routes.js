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
    // Se evalua que se reciba una imagen
    if (!req.files) {
        // NO se recibe imagen
        return res.status(500).json({
            status: 'error',
            code: 500,
            mensaje: 'NO existen archivos por subir'
        });
    } else {
        // Se recibe imagen
        // Obtener nombre de la imagen
        let imagen = req.files.imagen;
        let partesNombreImagen = imagen.name.split('.');
        let extensionArchivo = partesNombreImagen[partesNombreImagen.length - 1];

        //validación de extensiones
        let extensiones = ['png', 'jpg', 'gif', 'jpeg'];
        if (extensiones.indexOf(extensionArchivo) < 0) {
            // Extensiones invalidas
            return res.status(500).json({
                status: 'error',
                code: 500,
                mensaje: 'Extensión invalida',
                errors: { message: 'las extensiones solo pueden ser ' + extensiones.join('|') }
            });
        } else {
            // Extensiones válidas
            var modelo = req.params.modelo;
            var id = req.params.id;

            // Se valida que sea un modelo valido
            var modelosValidos = ['usuarios', 'medicos', 'hospitales'];
            if (modelosValidos.indexOf(modelo) < 0) {
                // Modelo invalido
                return res.status(500).json({
                    status: 'error',
                    code: 500,
                    mensaje: 'Modelo invalido',
                    errors: { message: 'las modelos solo pueden ser ' + modelosValidos.join('|') }
                });
            } else {
                //Modelo Valido
                let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
                subirPorTipo(modelo, id, nombreArchivo, imagen, res);
            }
        }
    }
});

function subirPorTipo(modelo, id, nombreArchivo, imagen, res) {
    switch (modelo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (err || !usuario) {
                    return res.status(500).json({
                        status: 'error',
                        code: 500,
                        mensaje: 'Usuario invalido',
                        errors: err
                    });
                } else {
                    var pathViejo = './uploads/' + modelo + '/' + usuario.img;
                    let path = './uploads/' + modelo + '/' + nombreArchivo;

                    // Se coloca la imagen dentro de la carpeta correspondiente
                    imagen.mv(path, function(err) {
                        if (err) {
                            return res.status(500).json({
                                status: 'error',
                                code: 500,
                                mensaje: 'error al guardar la imagen en el repositorio',
                                errors: err
                            });
                        } else {
                            // Se revisa que existiera una imagen previa asignada al usuario
                            if (fs.existsSync(pathViejo)) {
                                // Se elimina la imagen
                                fs.unlink(pathViejo, (err) => {
                                    if (err) {
                                        return res.status(500).json({
                                            status: 'error',
                                            code: 500,
                                            mensaje: 'Imagen actual cargada - Error al eliminar imagen anterior del usuario',
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
                                        mensaje: 'Error al actualizar nombre de imagen del usuario',
                                        errors: err
                                    });
                                } else {
                                    usuarioActualizado.password = '---';
                                    return res.status(200).json({
                                        status: 'ok',
                                        code: 200,
                                        mensaje: 'Imagen actual cargada - Nombre de imagen actualizado!!!',
                                        usuarioActualizado: usuarioActualizado
                                    });
                                }
                            });

                        }

                    });
                }
            });
            break;

        case 'medicos':
            Medico.findById(id, (err, medico) => {
                if (err || !medico) {
                    return res.status(500).json({
                        status: 'error',
                        code: 500,
                        mensaje: 'Médico invalido',
                        errors: err
                    });
                } else {
                    var pathViejo = './uploads/' + modelo + '/' + medico.img;
                    let path = './uploads/' + modelo + '/' + nombreArchivo;

                    // Se coloca la imagen dentro de la carpeta correspondiente
                    imagen.mv(path, function(err) {
                        if (err) {
                            return res.status(500).json({
                                status: 'error',
                                code: 500,
                                mensaje: 'error al guardar la imagen en el repositorio',
                                errors: err
                            });
                        } else {
                            // Se revisa que existiera una imagen previa asignada al médico
                            if (fs.existsSync(pathViejo)) {
                                // Se elimina la imagen
                                fs.unlink(pathViejo, (err) => {
                                    if (err) {
                                        return res.status(500).json({
                                            status: 'error',
                                            code: 500,
                                            mensaje: 'Imagen actual cargada - Error al eliminar imagen anterior del médico',
                                            errors: err
                                        });
                                    }
                                });
                            }

                            // Se actualiza el nombre de la imagen en la BD
                            medico.img = nombreArchivo;
                            medico.save((err, medicoActualizado) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: 'error',
                                        code: 500,
                                        mensaje: 'Error al actualizar nombre de imagen del médico',
                                        errors: err
                                    });
                                } else {
                                    return res.status(200).json({
                                        status: 'ok',
                                        code: 200,
                                        mensaje: 'Imagen actual cargada - Nombre de imagen actualizado!!!',
                                        medicoActualizado: medicoActualizado
                                    });
                                }
                            });

                        }

                    });
                }
            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                if (err || !hospital) {
                    return res.status(500).json({
                        status: 'error',
                        code: 500,
                        mensaje: 'Hospital invalido',
                        errors: err
                    });
                } else {
                    var pathViejo = './uploads/' + modelo + '/' + hospital.img;
                    let path = './uploads/' + modelo + '/' + nombreArchivo;

                    // Se coloca la imagen dentro de la carpeta correspondiente
                    imagen.mv(path, function(err) {
                        if (err) {
                            return res.status(500).json({
                                status: 'error',
                                code: 500,
                                mensaje: 'error al guardar la imagen en el repositorio',
                                errors: err
                            });
                        } else {
                            // Se revisa que existiera una imagen previa asignada al hospital
                            if (fs.existsSync(pathViejo)) {
                                // Se elimina la imagen
                                fs.unlink(pathViejo, (err) => {
                                    if (err) {
                                        return res.status(500).json({
                                            status: 'error',
                                            code: 500,
                                            mensaje: 'Imagen actual cargada - Error al eliminar imagen anterior del hospital',
                                            errors: err
                                        });
                                    }
                                });
                            }

                            // Se actualiza el nombre de la imagen en la BD
                            hospital.img = nombreArchivo;
                            hospital.save((err, hospitalActualizado) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: 'error',
                                        code: 500,
                                        mensaje: 'Error al actualizar nombre de imagen del hospital',
                                        errors: err
                                    });
                                } else {
                                    return res.status(200).json({
                                        status: 'ok',
                                        code: 200,
                                        mensaje: 'Imagen actual cargada - Nombre de imagen actualizado!!!',
                                        hospitalActualizado: hospitalActualizado
                                    });
                                }
                            });

                        }

                    });
                }
            });
            break;
    }
}

module.exports = app;