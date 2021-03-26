module.exports = function(app) {

    //Comprobamiento de los parámetros, tratamiento si es null.
    app.get("/canciones", function(req, res) {
            let respuesta= "";

            if (req.query.nombre != null)
                respuesta += 'Nombre: ' + req.query.nombre + '<br>';

            if (typeof (req.query.autor) != "undefined")
                respuesta += 'Autor: ' + req.query.autor;

            res.send(respuesta);
    });

    //Referencia a la clave pasada en URL.
    app.get('/canciones/:id', function(req, res) {
        let respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    });

    //Específicamos el orden específico. (Cuidado al poner otro orden en la uri)
    app.get('/canciones/:genero/:id', function(req, res) { let respuesta = 'id: ' + req.params.id + '<br>'

        +	'Género: ' + req.params.genero; res.send(respuesta);
    });

    //Comprobamiento del sumado, importante el Casting.
    app.get('/suma', function(req,res)  {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);

        res.send(String(respuesta));
    });

    //Comodines: (Se puede usar todas las expresiones regulares
    // -> http://expressjs.com/es/guide/routing.html
    app.get('/promo*', function (req,res){
        res.send('Respuesta patrón promo*')
    })

    //Aquí usamos el body parser.
    app.post("/cancion",function (req,res){
        res.send("Canción agregada:"+req.body.nombre + "<br>"
            + " genero: " + req.body.genero+" <br>"
            +" precio: " + req.body.precio);
    });
};
