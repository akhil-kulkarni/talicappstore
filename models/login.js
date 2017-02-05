var mongoose = require("mongoose");
var commonFunctions = require("../common/commonFunctions.js");
var config = commonFunctions.config();

//connect to database
var db = mongoose.connect(config.mongodb);

var loginSchema = new mongoose.Schema({
	username: String,
	password: String,
	loginTimestamp: Date
}, {collection: "loginCollection"});

var loginModel = mongoose.model('login', loginSchema);

//loginModel.remove().exec();

loginModel.count({"username": "dev"}).exec(
	function(err, count){
		if(err){
			console.log("error dev count: " + err);
		}
		if(count<1){
			var devLoginRec = new loginModel({"username": "dev", "password": commonFunctions.getHashedPassword("dev"), "loginTimestamp": null});
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
			var adminLoginRec = new loginModel({"username": "admin", "password": commonFunctions.getHashedPassword("admin"), "loginTimestamp": null});
			adminLoginRec.save();
		}
	}
);


//compile schema to model
module.exports = db.model('login', loginSchema);
