//Módulos
let express = require('express');
let app = express();

//Variables
app.set('port', 8081);

app.get('/usuario', function (rezq,res){
    console.log("depurar aqui");
    res.send('ver usuarios');
});
app.get('/canciones', function (rezq,res){
    res.send('ver canciones');
});

//lanzar el servicio
app.listen(app.get('port'),function (){
    console.log('Servidor activo')
});