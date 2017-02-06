var crypto = require('crypto');
var constants = require('../constants.js');
var env = require('../env.json');
var path = require('path'); //used for file path
var fs = require('fs-extra'); //File System - for file manipulation
var mime = require('mime');
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
		return env[process.env.NODE_ENV || 'development'];
	},
	saveFile: function(file, filename, saveFileCallback){
		var fname = "";
		var fext = "";
		if(!!filename){
			var fileNameArr = filename.split(".");
			if(fileNameArr.length>2){
				for(var i=0;i<(fileNameArr.length-1);i++){
					fname += fileNameArr[i] + ((i!=((fileNameArr.length-1)))?".":"");
				}
				fext = fileNameArr[(fileNameArr.length-1)];
			}
			else if(fileNameArr.length==2){
				fname = fileNameArr[0];
				fext = fileNameArr[1];
			}

			console.log("fname: " + fname);
			console.log("fext: " + fext);

			if(!!fext && (constants.allowedFileTypes.indexOf("_"+fext+"_")!==-1)){

				if (!fs.existsSync(constants.uploadsFolderPath)){
					fs.mkdirSync(constants.uploadsFolderPath);
				}

				if (!fs.existsSync(constants.uploadsFolderPath + "/" + fext)){
					fs.mkdirSync(constants.uploadsFolderPath + "/" + fext);
				}

				//Path where apk/ipa will be uploaded
				fstream = fs.createWriteStream(constants.uploadsFolderPath + "/" + fext + "/" + filename);
				file.pipe(fstream);
				fstream.on('close', function () {
					console.log("Upload Finished of " + filename);
					saveFileCallback({success: true}); //where to go next
				});
			}
			else{
				saveFileCallback({success: false, msg: "invalid file type!"}); //where to go next
			}
		}
		else{
			saveFileCallback({success: false, msg: "file not found!"}); //where to go next
		}
	}
};

module.exports = commonFunctions;
