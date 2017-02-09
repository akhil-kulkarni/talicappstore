var mongoose = require('mongoose');
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
	},
	getFileListWithMetaData: function(isProduction, callback){
		filesModel.find({isProduction: isProduction, fileDeletedOn: null}).select('fileName fileType filePath fileSize fileVersionNumber projectName appVersionNumber fileCreatedBy fileUpdatedBy fileCreatedOn fileUpdatedOn changeLog totalDownloads').sort('-fileUpdatedOn').exec(function(err, files){
			if(!!err){
				return callback(err);
			}
			var fileList = JSON.parse(JSON.stringify(files));
			if(!!fileList && fileList.length>0){
				fileList.forEach(function(file){
					file.changeLog = (file.changeLog).filter(function(fl){
						return (fl.fileVersionNumber==file.fileVersionNumber);
					});
					file.changeLog = (file.changeLog[0].changeLog).split("|");
					file.fileUpdatedOn = new Date(file.fileUpdatedOn);
					file.filePath += file.fileName;
					file.itms = "itms-services://?action=download-manifest&amp;url=https://lp.tataaia.com/Insight-Info.plist";
				});
				return callback(err, fileList);
			}
			else{
				return callback("no file found", null);
			}
		});
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


module.exports = modelFunctions;
