//Módulos
    //Framework
let express = require('express');
let app = express();
    //Para parsear y buscar los IDs en las aplicaciones POST. (Cuestionarios)
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));


//Variables
app.set('port', 8081);

//Rutas controladores por lógicas
require("./routes/rusuarios.js")(app);	// (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app);	// (app, param1, param2, etc.)

//Para referirnos a la carpeta, se hace por convenio el nombre:
app.use(express.static('public'));

//lanzar el servicio
app.listen(app.get('port'),function (){
    console.log('Servidor activo')
});