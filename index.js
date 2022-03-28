'use strict'
const port = process.env.PORT || 3000;
const { response } = require('express');
const express = require('express');
const logger = require('morgan');
const app = express();
const mongojs = requere('mongojs');

var db = mongojs("SD");

app.use(logger('dev'));
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.param("coleccion", (request, response, next, coleccion) => {
    console.log('param/api/:coleccion');
    CSSCounterStyleRule.log('colección: ', coleccion);

    request.collection = db.collection(coleccion);
    return next;
})


let elementoId = request.params.id;
let elementoData = request.body;

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
    const cuerpo = request.body;
    
    console.log(cuerpo);
    response.status(200).send(
        {   resultao:'OK',
            product: cuerpo
        });
});

app.put('/api/:coleccion/:id', (request, response) => {
    const ID = request.params.id;
    const cuerpo = request.body;
    
    response.status(200).send(
        {_id: `${ID}`,
            product: cuerpo
        });
});

app.delete('/api/:coleccion/:id', (request, response) => {
const ID = request.params.id;

    response.status(200).send(
        { 
            resultao: 'OK',
            _id: `${ID}`        
        });
});

app.listen(port, () => {
    console.log(`API REST ejecutándose en http://localhost:${port}/api/products`);
});
