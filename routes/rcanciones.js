module.exports = function (app, swig, gestorBD) {

    /*
    //Comprobamiento de los parámetros, tratamiento si es null.
    app.get("/canciones", function(req, res) {
            let respuesta= "";

            if (req.query.nombre != null)
                respuesta += 'Nombre: ' + req.query.nombre + '<br>';

            if (typeof (req.query.autor) != "undefined")
                respuesta += 'Autor: ' + req.query.autor;

            res.send(respuesta);
    }); */

    //Borrado de canciones:
    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.eliminarCancion(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });

    //Usando swig con swig.rederFile recibimos la plantilla y los parámetros a usar
    app.get("/canciones", function (req, res) {
        let canciones = [{
            "nombre": "Blank space",
            "precio": "1.2"
        }, {
            "nombre": "See you again",
            "precio": "1.3"
        }, {
            "nombre": "Uptown Funk",
            "precio": "1.1"
        }];
        let respuesta = swig.renderFile('view/btienda.html',
            {
                vendedor: 'Tienda de canciones',
                canciones: canciones
            });
        res.send(respuesta);
    });

    //Ojo cuidado, tenemos que poner este método primero para que no nos redireccione al de id = agregar, CUIDAO
    app.get('/canciones/agregar', function (req, res) {

        let respuesta = swig.renderFile('view/bagregar.html', {});
        res.send(respuesta);
    });

    //Referencia a la clave pasada en URL.
    app.get('/cancion/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send("Error al recuperar la canción.");
            } else {

                //Obtenemos los comentarios:
                let criterio_comentarios = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};

                gestorBD.obtenerComentarios(criterio_comentarios, function (comentarios) {

                    if (comentarios == null) {
                        res.send(respuesta);
                    } else {
                        let respuesta = swig.renderFile('view/bcancion.html',
                            {
                                cancion: canciones[0],
                                comentarios: comentarios
                            });
                        res.send(respuesta);
                    }
                });
            }
        });
    });

    //Específicamos el orden específico. (Cuidado al poner otro orden en la uri)
    app.get('/canciones/:genero/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id + '<br>'

            + 'Género: ' + req.params.genero;
        res.send(respuesta);
    });

    //Comprobamiento del sumado, importante el Casting.
    app.get('/suma', function (req, res) {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);

        res.send(String(respuesta));
    });

    //Comodines: (Se puede usar todas las expresiones regulares
    // -> http://expressjs.com/es/guide/routing.html
    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo*')
    });


    //Aquí usamos el body parser.
    app.post("/cancion", function (req, res) {

        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
            //Añadimos el user también:
            autor: req.session.usuario
        };
        // Conectarse
        gestorBD.insertarCancion(cancion, function (id) {
            if (id == null) {
                res.send("Error al insertar canción");
            } else {
                //Añadimos la gestión de la portada:
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function (err) {
                        if (err) {
                            res.send("Error al subir la portada");
                        } else {
                            //Gestión de música:
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv('public/audios/' + id + '.mp3', function (err) {
                                    if (err) {
                                        res.send("Error al subir el audio");
                                    } else {
                                        res.redirect("/publicaciones");
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    app.get("/tienda", function (req, res) {
        //Al filtrar con criterio debemos ponerlo:
        let criterio = {};

        //Comprobamos si hay búsqueda:
        if (req.query.busqueda != null) {
            // ¡Usamos regex para que no sea exacta! OJO
            criterio = {"nombre": {$regex: ".*" + req.query.busqueda + ".*"}};
        }

        //Comprobamos si existe el parámetro para la paginación:
        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

        //Ahora obtenemos las canciones paginadas:
        gestorBD.obtenerCancionesPg(criterio, pg, function (canciones, total) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total / 4;
                if (total % 4 > 0) {
                    // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = []; // paginas mostrar
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('view/btienda.html',
                    {   canciones : canciones,
                        paginas : paginas,
                        actual : pg
                    });
                res.send(respuesta);
            }
        });
    });

    //Para las canciones del autor:
    app.get("/publicaciones", function (req, res) {
        let criterio = {autor: req.session.usuario};

        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {

                let respuesta = swig.renderFile('view/bpublicaciones.html',
                    {
                        canciones: canciones
                    });
                res.send(respuesta);
            }
        });
    });

    //Modificar canciones:
    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {

                let criterio_comentarios = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};

                gestorBD.obtenerComentarios(criterio_comentarios, function (comentarios) {

                    if (comentarios == null) {
                        res.send(respuesta);
                    } else {
                        let respuesta = swig.renderFile('view/bcancion.html',
                            {
                                cancion: canciones[0],
                                comentarios: comentarios
                            });
                        res.send(respuesta);
                    }
                });
            }
        });
    });

    //El post de modificar:
    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": gestorBD.mongo.ObjectID(id)};

        let cancion = {
            nombre: req.body.nombre, genero: req.body.genero, precio: req.body.precio
        };

        gestorBD.modificarCancion(criterio, cancion, function (result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if (result == null) {
                        res.send("Error en la modificación");
                    } else {
                        res.redirect("/publicaciones");
                    }
                });
            }
        });

    });

    //TIENDA
    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let compra = {
            usuario: req.session.usuario, cancionId: cancionId
        }

        gestorBD.insertarCompra(compra, function (idCompra) {
            if (idCompra == null) {
                res.send(respuesta);
            } else {
                res.redirect("/compras");
            }
        });
    });

    app.get('/compras', function (req, res) {
        let criterio = {"usuario": req.session.usuario};
        gestorBD.obtenerCompras(criterio, function (compras) {
            if (compras == null) {
                res.send("Error al listar ");
            } else {
                let cancionesCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    cancionesCompradasIds.push(compras[i].cancionId);
                }
                let criterio = {"_id": {$in: cancionesCompradasIds}}
                gestorBD.obtenerCanciones(criterio, function (canciones) {
                    let respuesta = swig.renderFile('view/bcompras.html', {
                        canciones: canciones
                    });
                    res.send(respuesta);
                });
            }
        });
    });

    //FUNCIONES PARA MODIFICAR:
    function paso1ModificarPortada(files, id, callback) {
        if (files && files.portada != null) {
            let imagen = files.portada;
            imagen.mv('public/portadas/' + id + '.png', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    }

    function paso2ModificarAudio(files, id, callback) {
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/' + id + '.mp3', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    }

};
