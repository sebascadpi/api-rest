'use strict'

// Importes 
const port = process.env.PORT || 3000;
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
	response.header("Access-Control-Allow-Header", "token");
	return next();
};

var auth = (request, response, next) => {
    if(request.headers.token === "password1234"){
        return next();
    } else {
        return next(new Error("No autorizado, por puto"));
    };
};

 
// Middleware
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(allowCrossTokenHeader);
app.use(allowMethods);


app.param("coleccion", (request, response, next, coleccion) => {
    /*console.log('param/api/:coleccion');
    console.log('coleccion: ', coleccion);
    */
    request.collection = db.collection(coleccion);
    return next();
})

app.get('/api',(request, response, next)=> {
    /*console.log('GET /api');
    console.log(request.params);
    console.log(request.collection);
    */
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

app.get('/api/:coleccion/:id', (request, response, next) => {
    request.collection.findOne({_id: id(request.params.id)}, (err, elemento) => {
        if(err) return next(err);
        response.json(elemento);
    });
});

app.post('/api/:coleccion', auth, (request, response, next) => {
    const elemento = request.body;
    /*const just =request.headers.authorization.split('')[1];
    tokenService.decodificaToken(jwt)
        then (userId => {
            request.user = {id: iserId
                token: jwt};

            return next();
        })
        catch (err =>
            response.status(400).json({
                result: 'ko',
                msg: 'err'
            });
        );*/

    
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

app.listen(port, () => {
    console.log(`API REST ejecutándose en http://localhost:${port}/api/:coleccion/:id`);
});
