var crypto = require('crypto');
var env = require('../env.json');
var commonFunctions = {
	getHashedPassword: function(username){
		var salt = username + "|talicappstore";
		var password = "Tata_001";
		if(username==="admin"){
			password = "_T@l!cSuck$_";
		}
		password = crypto.createHash('sha256').update(password).digest('hex') + '';
		salt = crypto.createHash('sha256').update(salt).digest('hex') + '';
		var hash = crypto.pbkdf2Sync(password, salt, 1000, 512/8, "sha256");
		return (hash.toString("hex") + "");
	},
	config: function(){
		var node_env = process.env.NODE_ENV || 'development';
		return env[node_env];
	},
	validatePassword: function(reqUsername, reqPassword){

	}
};

module.exports = commonFunctions;
