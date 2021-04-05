module.exports = {
    mongo: null, app: null,
        init: function (app, mongo) {
            this.mongo = mongo;
            this.app = app;
        },

    //Usuarios para añadir:
    insertarUsuario : function(usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios'); collection.insert(usuario, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },

    obtenerUsuarios : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {

                let collection = db.collection('usuarios'); collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    }
                    db.close();
                });
            }
        });
    },


    //Filtramos con le criterio:
    obtenerCanciones: function (criterio,funcionCallback) {
            this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
                if (err) {
                    funcionCallback(null);
                } else {

                    let collection = db.collection('canciones');
                    //Añadimos el criterio:
                    collection.find(criterio).toArray(function (err, canciones) {
                        if (err) {
                            funcionCallback(null);
                        } else {
                            funcionCallback(canciones);
                        }
                        db.close();
                    });
                }
        });
    },


    insertarCancion: function (cancion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('canciones');
                collection.insertOne(cancion, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }

};
