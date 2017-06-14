var mongoose = require("mongoose");
var crypto = require('crypto');

var loginSchema = new mongoose.Schema({
	username: String,
	password: String,
	loginTimestamp: Date
}, {collection: "loginCollection"});

var loginModel = mongoose.model('login', loginSchema);

function getHashedPassword(username){
	var salt = username + "|appstore";
	var password = "Tata_001";
	if(username==="admin"){
		password = "_T@l!cSuck$_";
	}
	password = crypto.createHash('sha256').update(password).digest('hex') + '';
	salt = crypto.createHash('sha256').update(salt).digest('hex') + '';
	var hash = crypto.pbkdf2Sync(password, salt, 1000, 512/8, "sha256");
	return (hash.toString("hex") + "");
}

//loginModel.remove().exec();
loginModel.count({"username": "dev"}).exec(
	function(err, count){
		if(err){
			console.log("error dev count: " + err);
		}
		if(count<1){
			var devLoginRec = new loginModel({"username": "dev", "password": getHashedPassword("dev"), "loginTimestamp": null});
			devLoginRec.save();
		}
	}
);

loginModel.count({"username": "admin"}).exec(
	function(err, count){
		if(err){
			console.log("error admin count: " + err);
		}
		if(count<1){
			var adminLoginRec = new loginModel({"username": "admin", "password": getHashedPassword("admin"), "loginTimestamp": null});
			adminLoginRec.save();
		}
	}
);


//compile schema to model
module.exports = mongoose.model('login', loginSchema);
