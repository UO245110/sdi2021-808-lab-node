module.exports = function (app,swig, gestorBD){

    app.post('/comentarios/:cancion_id',function(req,res) {
        let cancion_id = gestorBD.mongo.ObjectID(req.params.cancion_id);
        let comentario = {
            autor: req.session.usuario,
            texto: req.body.texto,
            cancion_id: cancion_id
        };
        //Insertamos el comentario
        gestorBD.insertarComentario(comentario, function (result) {
            if (result == null) {
                res.send("No se ha podido insertar comentario");
            } else {
                res.redirect('/cancion/' + req.params.cancion_id);
            }

        });
    });

};