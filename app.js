//Módulos
    //Framework
let express = require('express');
let app = express();


//Para subida de ficheros;
let fileUpload = require('express-fileupload');
app.use(fileUpload());

    //Para parsear y buscar los IDs en las aplicaciones POST. (Cuestionarios)
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));



    //Renderizado de plantillas: http://node-swig.github.io/swig-templates/docs/tags/
let swig  = require('swig');
    //Database de mongodb:
let mongo = require('mongodb');

//Para usar nuestro objeeto Base de datos:
let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

//Variables
app.set('port', 8081);
app.set('db','mongodb://admin:sdi@cluster0-shard-00-00.7mkjh.mongodb.net:27017,cluster0-shard-00-01.7mkjh.mongodb.net:27017,cluster0-shard-00-02.7mkjh.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-corpmm-shard-0&authSource=admin&retryWrites=true&w=majority');

//Rutas controladores por lógicas
require("./routes/rusuarios.js")(app, swig, gestorBD);	// (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app, swig,gestorBD);	// (app, param1, param2, etc.)
require("./routes/rautores.js")(app, swig);

//Para referirnos a la carpeta, se hace por convenio el nombre:
app.use(express.static('public'));

//lanzar el servicio
app.listen(app.get('port'),function (){
    console.log('Servidor activo')
});