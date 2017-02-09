var crypto = require('crypto');
var constants = require('../constants.js');
var env = require('../env.json');
var path = require('path'); //used for file path
var fs = require('fs-extra'); //File System - for file manipulation
var mime = require('mime');
var modelFunctions = require('./modelFunctions.js');

var commonFunctions = {
	getLoginModelCount: function(req, callback){
		modelFunctions.getLoginModelCount(req, callback);
	},
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
	},
	getFileExt: function(fileName){
		if(!!fileName){
			var fileNameArr = fileName.split(".");
			return (fileNameArr[fileNameArr.length-1]);
		}
		else{
			return null;
		}
	},
	updateFilesModel: function(fileData, callback){
		if(!!fileData){
			fileData.fileType = this.getFileExt(fileData.fileName);
			fileData.filePath = constants.uploadsFolderPath + "/" + fileData.fileType + "/";
			modelFunctions.updateFilesModel(fileData, callback);
		}
		else{
			return callback("file data cannot be blank!");
		}
	},
	printAllFileRecords: function(){
		modelFunctions.printAllFileRecords();
	},
	getFileListWithMetaData: function(isProduction, callback){
		modelFunctions.getFileListWithMetaData(isProduction, callback);
	},
	ifCondHelper: function(v1, operator, v2, options){
		switch (operator) {
			case '==':
				return (v1 == v2) ? options.fn(this) : options.inverse(this);
			case '===':
				return (v1 === v2) ? options.fn(this) : options.inverse(this);
			case '!=':
				return (v1 != v2) ? options.fn(this) : options.inverse(this);
			case '!==':
				return (v1 !== v2) ? options.fn(this) : options.inverse(this);
			case '<':
				return (v1 < v2) ? options.fn(this) : options.inverse(this);
			case '<=':
				return (v1 <= v2) ? options.fn(this) : options.inverse(this);
			case '>':
				return (v1 > v2) ? options.fn(this) : options.inverse(this);
			case '>=':
				return (v1 >= v2) ? options.fn(this) : options.inverse(this);
			case '&&':
				return (v1 && v2) ? options.fn(this) : options.inverse(this);
			case '||':
				return (v1 || v2) ? options.fn(this) : options.inverse(this);
			default:
				return options.inverse(this);
		}
	},
	getTZISOString: function(offset){
		// expects timezone offset as parameter - default: IST(Indian Standard Time) = (-330)
		offset = offset || (-330);
		var tzISOString = (new Date((new Date().getTime())-((offset) * (60) * (1000)))).toISOString();
		return tzISOString;
	},
	getDateTimeToSend: function(tzISOString){
		// expects Date - ISO string as parameter
		var isoArr = tzISOString.replace("Z","").split("T");
		var isoDateArr = isoArr[0].split("-");
		var finalString = isoDateArr[2] + "-" + isoDateArr[1] + "-" + isoDateArr[0] + " " + isoArr[1];
		return finalString;
	}
};

module.exports = commonFunctions;
