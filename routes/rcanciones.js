module.exports = function(app, swig) {

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
            "nombre" : "Blank space",
            "precio" : "1.2"
        },{
            "nombre" : "See you again",
            "precio" : "1.3"
        },{
            "nombre" : "Uptown Funk",
            "precio" : "1.1"
        }];
        let respuesta = swig.renderFile('view/btienda.html',
            {
                vendedor : 'Tienda de canciones',
                canciones : canciones
            });
        res.send(respuesta);
    });

    //Ojo cuidado, tenemos que poner este método primero para que no nos redireccione al de id = agregar, CUIDAO
    app.get('/canciones/agregar', function (req, res) {
        let respuesta = swig.renderFile('view/bagregar.html', {

        });
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
