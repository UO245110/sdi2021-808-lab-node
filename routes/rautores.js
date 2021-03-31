module.exports = function(app, swig) {

    //Ojo cuidado, tenemos que poner este método primero para que no nos redireccione al de id = agregar, CUIDAO
    app.get('/autores/agregar', function (req, res) {
        let roles = [{
            "rol" : "Vientista"
        },{
            "rol" : "Cuerdista"
        },{
            "rol" : "Percusionista"
        }];
        let respuesta = swig.renderFile('view/autores-agregar.html',
            {
                vendedor : 'Tienda de canciones',
                roles : roles
            });
        res.send(respuesta);
    });

    //Aquí usamos el body parser.
    app.post("/autores",function (req,res){
        let respuesta = "Autor agregado: ";

        if (req.body.nombre !== undefined){
            respuesta+= req.body.nombre;
        }
        else {
            respuesta+= "no definido";
        }
        respuesta+= "<br>" + "Grupo del autor: ";

        if (req.body.grupo !== undefined){
            respuesta+= req.body.grupo;
        }
        else {
            respuesta+= "no definido";
        }
        respuesta+= "<br>" + "Rol del autor: "+req.body.rol;

        res.send(respuesta);

    });

    //Usando swig con swig.rederFile recibimos la plantilla y los parámetros a usar
    app.get("/autores", function (req, res) {
        let autores = [{
            "nombre" : "Mari Nieves",
            "grupo" : "Drumi",
            "rol" : "Artista y compositora"
        },{
            "nombre" : "Sabe Onda",
            "grupo" : "Leche Asturiana",
            "rol" : "Escritora"
        },{
            "nombre" : "Naiara Música",
            "grupo" : "Bershka",
            "rol" : "Pesada"
        }];
        let respuesta = swig.renderFile('view/bautores.html',
            {
                vendedor : 'Tienda de canciones',
                autores : autores
            });
        res.send(respuesta);
    });


    //Lo ponemos al final para que por prioridad se ejecute solo como última instancia:
    app.get('/autores*', function (req, res) {
        res.redirect('autores');
    });

};