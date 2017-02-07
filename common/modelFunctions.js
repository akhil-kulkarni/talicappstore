var mongoose = require('mongoose');
var commonFunctions = require("./commonFunctions");
var loginModel = require('../models/login.js');
var filesModel = require('../models/files.js');

var modelFunctions = {
	getLoginModelCount: function(whereClause, callback){
		//loginModel.find().exec(function (err, docs) {console.log(JSON.stringify(docs));});
		loginModel.count(whereClause).exec(callback);
	},
	printAllFileRecords: function(){
		filesModel.find().exec(function (err, docs) {console.log(JSON.stringify(docs));});
	},
	updateFilesModel: function(fileData, callback){
		if(!!fileData){
			fileData.fileType = commonFunctions.getFileExt(fileData.fileName);
			if(!!fileData._id){
				filesModel.findOne({_id: fileData._id}, 'fileVersionNumber changeLog', function(err, file){
					if(err){
						return callback(err);
					}
					console.log("in findOne: " + file.fileVersionNumber);
					var fileVersionNumber = file.fileVersionNumber;
					fileData.fileVersionNumber = ++fileVersionNumber;
					var changeLog = fileData.changeLog;
					var fileChangeLog = JSON.parse(JSON.stringify(file.changeLog));
					console.log("final changelog: " + fileChangeLog);
					fileChangeLog.push({fileVersionNumber: fileData.fileVersionNumber, changeLog: changeLog});
					fileData.changeLog = fileChangeLog;
					filesModel.update({_id: fileData._id}, fileData, callback);
				});
			}
			else{
				delete fileData._id;
				fileData.fileVersionNumber = 1;
				fileData.changeLog = {fileVersionNumber: fileData.fileVersionNumber, changeLog: fileData.changeLog};
				var newFile = new filesModel(fileData);
				newFile.save(callback);
			}
		}
		else{
			callback("file related data cannot be blank!");
		}
	}
};


module.exports = modelFunctions;
