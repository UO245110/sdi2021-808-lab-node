module.exports = function(app, gestorBD) {

    app.get("/api/cancion", function(req, res) {
        gestorBD.obtenerCanciones( {} , function(canciones) { if (canciones == null) {
            res.status(500); res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.send( JSON.stringify(canciones) );
        }
        });
    });


    app.get("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerCanciones(criterio,function(canciones){ if ( canciones == null ){
            res.status(500); res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.send( JSON.stringify(canciones[0]) );
        }
        });
    });

    app.get("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerCanciones(criterio,function(canciones){ if ( canciones == null ){
            res.status(500); res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.send( JSON.stringify(canciones[0]) );
        }
        });
    });

    app.delete("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.eliminarCancion(criterio,function(canciones){ if ( canciones == null ){
            res.status(500); res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.send( JSON.stringify(canciones) );
        }
        });
    });

    app.post("/api/cancion", function(req, res) {
        let cancion = {
            nombre : req.body.nombre, genero : req.body.genero, precio : req.body.precio,
        };
        // ¿Validar nombre, genero, precio?
        gestorBD.insertarCancion(cancion, function(id){
            if (id == null) { res.status(500); res.json({
                error : "se ha producido un error"
            })
            } else {
                res.status(201); res.json({
                    mensaje : "canción insertada",
                    _id : id
                })
            }
        });
    });

    app.put("/api/cancion/:id", function(req, res) {

        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

        let cancion = {}; // Solo los atributos a modificar
        if ( req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if ( req.body.genero != null)
            cancion.genero = req.body.genero;
        if ( req.body.precio != null)
            cancion.precio = req.body.precio;

        gestorBD.modificarCancion(criterio, cancion, function(result) { if (result == null) {
            res.status(500); res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200); res.json({
                mensaje : "canción modificada",
                _id : req.params.id
            })

        }
        });
    });

    //Autentificación con Token por SESIÓN NO ÚNICO:
    app.post("/api/autenticar/",function (req,res) {
        let seguro = app.get("crypto").createHmac('sha256',app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        };
        gestorBD.obtenerUsuarios(criterio,function (usuarios) {
            if(usuarios == null || usuarios.length == 0){
                res.status(401); //Unauthorized
                res.json({autenticado : false});
            }else{
                let token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");

                res.status(200);
                res.json({autenticado : true, token : token});
            }
        });
    });

    //Complementario gatitos:
    app.get("/api/gatitos/",function (req,res) {
        let configuracion = {
            url: "https://cat-fact.herokuapp.com/facts",
            method: "get",
            headers: {
                "token" : "ejemplo"
            }
        };
        let rest = app.get("rest");
        rest(configuracion,function (error,response,body) {
            console.log("cod: " + response.statusCode + " Cuerpo :" + body);
            let objetoRespuesta = JSON.parse(body);
            console.log(objetoRespuesta);
            res.status(200);
            let i = Math.floor(Math.random() * objetoRespuesta.length);
            console.log(i);
            res.json({datoGato : objetoRespuesta[i].text});
            console.log(objetoRespuesta[i].text);
        })
    });
};
