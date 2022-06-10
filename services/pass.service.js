'use strict'

const bcrypt = require('bcrypt');

// encriptaPassword
//
//Devuelve un hash con un salt incluido en formato:

// formato del hash: 
// 		$2b$10$uOXWrh1v6B.haR7hDmW6j.dcoh.bVTO6kGKGO82lkNNzKGChk15AK
// 		****-- ***********************************++++++++++++++++++
// 		Alg const				Salt 					Hash


function encriptaPassword( password ) 
{
	return bcrypt.hashSync( password, 10);
}

// comparaPassword
//
// Devolver verdadero o falso si coinciden o no el pass y el hash
//

function comparaPassword( password, hash)
{
	return bcrypt.compareSync( password, hash );
}

module.exports = {
	encriptaPassword,
	comparaPassword
};
