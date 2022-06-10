'use strict'

// Importes 
const port = process.env.PORT || 3000;

const https = require('https');
const fs = require('fs');

const OPTIONS_HTTPS = {
    key: fs.readFileSync('./cert/key-pen'),
    cert: fs.readFileSync('./cert/cert.pen')
};

const TokenService = require('./services/token.service');
const PassService = require('./services/pass.service');
const express = require('express');
const logger = require('morgan');
const app = express();
const mongojs = require('mongojs');
const cors = require('cors');

// Declaraciones
var db = mongojs("SD");
var id = mongojs.ObjectID;


var allowMethods = (request, response, next) => {
	response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	return next();
};

var allowCrossTokenHeader = (request, response, next) => {
	response.header("Access-Control-Allow-Headers", "*");
	return next();
};

var allowCrossTokenOrigin = (request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    return next();
};

function auth (request, response, next){

    if(request.headers.authorization !== undefined){
        const token = request.headers.authorization.split(" ")[1];

    TokenService.decodificaToken(token)
        .then (userId => {
            request.user = { id: userId }
            return next();
        })
        .catch (err => response.status(400).json({ result: 'No', msg: err}))
    }
    else {
        response.status(402).json({ result: 'No', msg: 'No se ha mandado un token de autentificación'})
    }
    
}

 
// Middleware
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(allowCrossTokenHeader);
app.use(allowCrossTokenOrigin);
app.use(allowMethods);
app.use(cors());


app.param("coleccion", (request, response, next, coleccion) => {
    /*console.log('param/api/:coleccion');
    console.log('coleccion: ', coleccion);
    */
    request.collection = db.collection(coleccion);
    return next();
})

app.get('/api', auth,(request, response, next)=> {
    /*console.log('GET /api');
    console.log(request.params);
    console.log(request.collection);
    */
    db.getCollectionNames ((err, colecciones) => {
        if(err) return next(err);
        response.json(colecciones);
    })
})

app.get('/api/:coleccion', auth, (request, response,next) => {
    request.collection.find((err, coleccion) => {
        if(err) return next(err);
        response.json(coleccion);
    });
});

app.get('/api/:coleccion/:id', auth, (request, response, next) => {
    request.collection.findOne({_id: id(request.params.id)}, (err, elemento) => {
        if(err) return next(err);
        response.json(elemento);
    });
});

app.post('/api/:coleccion', auth, (request, response, next) => {
    const elemento = request.body;
    
    if(!elemento.title){
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

app.put('/api/:coleccion/:id', auth, (request, response, next) => {
    let elementoId = request.params.id;
    let elementoNuevo = request.body;
    request.collection.update({ _id: id(elementoId)},
    		{$set: elementoNuevo}, {safe: true, multi: false}, (err, elementoModif) => {
    	if(err) return next(err);
    	response.json(elementoModif);
    });
});

app.delete('/api/:coleccion/:id', auth, (request, response, next) => {
    let elementoId = request.params.id;

    request.collection.remove({_id: id(elementoId)}, (err, resultado) =>{
    	if(err) return next(err);
    	response.json(resultado);
    });
});


https.createServer(OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`API REST ejecutándose en https://localhost:${port}/api/:coleccion/:id`);
});


/*app.listen(port, () => {
    console.log(`API REST ejecutándose en http://localhost:${port}/api/:coleccion/:id`);
});*/
