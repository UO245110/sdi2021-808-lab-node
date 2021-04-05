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
                let respuesta = swig.renderFile('view/bcancion.html',
                    {
                        cancion: canciones[0]
                    });
                res.send(respuesta);
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
                                        res.send("Agregada id: " + id);
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

        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('view/btienda.html',
                    {
                        canciones: canciones
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
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('view/bcancionModificar.html',
                    {
                        cancion : canciones[0]
                    });
                res.send(respuesta);
            }
        });
    });

    //El post de modificar:
    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(id) };

        let cancion = {
            nombre : req.body.nombre, genero : req.body.genero, precio : req.body.precio
        };

        gestorBD.modificarCancion(criterio, cancion, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if( result == null){
                        res.send("Error en la modificación");
                    } else {
                        res.send("Modificado");
                    }
                });
            }
        });

    });

    //FUNCIONES PARA MODIFICAR:
    function paso1ModificarPortada(files, id, callback){
        if (files && files.portada != null) {
            let imagen =files.portada;
            imagen.mv('public/portadas/' + id + '.png', function(err) {
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

    function paso2ModificarAudio(files, id, callback){
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/'+id+'.mp3', function(err) {
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
