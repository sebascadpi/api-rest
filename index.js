'use strict'
const port = process.env.PORT || 3000;
const { response } = require('express');
const express = require('express');
const logger = require('morgan');
const app = express();
const mongojs = require('mongojs');

var db = mongojs("SD");
var id = mongojs.ObjectID;

app.use(logger('dev'));
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.param("coleccion", (request, response, next, coleccion) => {
    console.log('param/api/:coleccion');
    console.log('coleccion: ', coleccion);

    request.collection = db.collection(coleccion);
    return next();
})



app.get('/api',(request, response, next)=> {
    console.log('GET /api');
    console.log(request.params);
    console.log(request.collection);

    db.getCollectionNames ((err, colecciones) => {
        if(err) return next(err);
        response.json(colecciones);
    })
})

app.get('/api/:coleccion', (request, response,next) => {
    request.collection.find((err, coleccion) => {
        if(err) return next(err);
        response.json(coleccion);
    });
});

app.get('/api/:coleccion/:id', (request, response) => {
    request.collection.findOne({_id: id(request.params.id)}, (err, elemento) => {
        if(err) return next(err);
        response.json(elemento);
    });
});

app.post('/api/:coleccion', (request, response, next) => {
    const elemento = request.body;
    
    if(!elemento.nombre){
    	response.status(400).json({
    		error: 'Bad data',
    		description: 'Se precisa al menos un campo <nombre>'
    	});
    } else {
    	request.collection.save(elemento, (err, coleccionGuardada) => {
    		if(err) return next(err);
    		response.json(coleccionGuardada);
    	});
    }
});

app.put('/api/:coleccion/:id', (request, response, next) => {
    let elementoId = request.params.id;
    let elementoNuevo = request.body;
    request.collection.update({ _id: id(elementoId)},
    		{$set: elementoNuevo}, {safe: true, multi: false}, (err, elementoModif) => {
    	if(err) return next(err);
    	response.json(elementoModif);
    });
});

app.delete('/api/:coleccion/:id', (request, response, next) => {
    let elementoId = request.params.id;

    request.collection.remove({_id: id(elementoId)}, (err, resultado) =>{
    	if(err) return next(err);
    	res.json(resultado);
    });
});

app.listen(port, () => {
    console.log(`API REST ejecutándose en http://localhost:${port}/api/products`);
});
