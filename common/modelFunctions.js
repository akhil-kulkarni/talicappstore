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
	updateFilesModel: function(fileData, isDownload, callback){
		if(!!fileData){
			if(!!fileData._id){
				if(!!isDownload){
					filesModel.findOne({_id: fileData._id}, 'totalDownloads lastDownloadedOn', function(err, file){
						if(err){
							return callback(err);
						}
						fileData.totalDownloads = (file.totalDownloads + 1);
						fileData.lastDownloadedOn = new Date();
						filesModel.update({_id: fileData._id}, fileData, callback);
					});
				}
				else {
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
	getFileListWithMetaData: function(isProduction, __getDateTimeToSend, __getFileSizeReadable, callback){
		filesModel.find({isProduction: isProduction, fileDeletedOn: null}).select('fileName fileType filePath fileSize fileVersionNumber projectName appVersionNumber fileCreatedBy fileUpdatedBy fileCreatedOn fileUpdatedOn changeLog dependencies totalDownloads lastDownloadedOn').sort('-fileUpdatedOn').exec(function(err, files){
			if(!!err){
				return callback(err);
			}
			var fileList = JSON.parse(JSON.stringify(files));
			if(!!fileList && fileList.length>0){
				fileList.forEach(function(file){
					console.log("file: " + JSON.stringify(file));
					file.changeLog = (file.changeLog).filter(function(fl){
						return (fl.fileVersionNumber==file.fileVersionNumber);
					});
					file.changeLog = (file.changeLog[0].changeLog).split("|");
					if(!!file.fileCreatedOn)
						file.fileCreatedOn = __getDateTimeToSend(file.fileCreatedOn, true);
					if(!!file.fileUpdatedOn)
						file.fileUpdatedOn = __getDateTimeToSend(file.fileUpdatedOn, true);
					if(!!file.lastDownloadedOn)
						file.lastDownloadedOn = __getDateTimeToSend(file.lastDownloadedOn, true);
					if(!!file.fileSize){
						console.log("fileSize: " + file.fileSize);
						file.fileSize = __getFileSizeReadable({"size": file.fileSize, "unit": "bytes"});
						file.fileSize = file.fileSize.size + " " + file.fileSize.unit;
					}
					file.filePath += file.fileName;
					file.itms = "itms-services://?action=download-manifest&amp;url=https://lp.tataaia.com/Insight-Info.plist";
					file.isapk = true;
					if(file.fileType=='ipa' && !!file.dependencies){
						file.isapk = false;
						file.filePath = "itms-services://?action=download-manifest&amp;url=" + file.dependencies.filePath + file.dependencies.fileName;
					}
				});
				return callback(err, fileList);
			}
			else{
				return callback("no file found", null);
			}
		});
	}

};


module.exports = modelFunctions;
