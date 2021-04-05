//Módulos
//Framework
let express = require('express');
let app = express();

//Gestión de sesión: https://github.com/expressjs/session#express-session
let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

//Para encriptar:
let crypto = require('crypto');

//Para subida de ficheros;
let fileUpload = require('express-fileupload');
app.use(fileUpload());

//Para parsear y buscar los IDs en las aplicaciones POST. (Cuestionarios)
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//Renderizado de plantillas: http://node-swig.github.io/swig-templates/docs/tags/
let swig = require('swig');
//Database de mongodb:
let mongo = require('mongodb');

//Para usar nuestro objeeto Base de datos:
let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);

//Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:sdi@cluster0-shard-00-00.7mkjh.mongodb.net:27017,cluster0-shard-00-01.7mkjh.mongodb.net:27017,cluster0-shard-00-02.7mkjh.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-corpmm-shard-0&authSource=admin&retryWrites=true&w=majority');
//Estas son para crypto:
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

//Primero ponemos el controlador antes de las rutas y los statics. Recordar: PRIORIDAD descendente
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) {
    //Dejamos correr la petición
        next();
    } else {
        console.log("va a : " + req.session.destino); //Chequeamos la url no accesible
        res.redirect("/identificarse"); //Redirigimos:
    }
});
//Aplicar routerUsuarioSession
app.use("/canciones/agregar",routerUsuarioSession);
app.use("/publicaciones",routerUsuarioSession);

//Hay que comprobar que se es el dueño de los audios, más nivel de detalle:
let routerAudios = express.Router();
routerAudios.use(function(req, res, next) {
    console.log("routerAudios");
    let path = require('path');
    let idCancion = path.basename(req.originalUrl, '.mp3');

    gestorBD.obtenerCanciones(
        {"_id": mongo.ObjectID(idCancion) }, function (canciones) {

            if(req.session.usuario && canciones[0].autor == req.session.usuario ){
                next();
            } else {
                res.redirect("/tienda");
            }
        })

});
//Aplicar routerAudios
app.use("/audios/",routerAudios);


//Rutas controladores por lógicas
require("./routes/rusuarios.js")(app, swig, gestorBD);	// (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app, swig, gestorBD);	// (app, param1, param2, etc.)
require("./routes/rautores.js")(app, swig);

//Para referirnos a la carpeta, se hace por convenio el nombre:
app.use(express.static('public'));

//lanzar el servicio
app.listen(app.get('port'), function () {
    console.log('Servidor activo')
});