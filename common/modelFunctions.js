var mongoose = require('mongoose');
var loginModel = require('../models/login.js');
var filesModel = require('../models/files.js');
var emailsModel = require('../models/emails.js');
var constants = require('../constants.js');
var burstShortId = require('burst-short-id');

var modelFunctions = {
	getLoginModelCount: function(whereClause, callback){
		loginModel.count(whereClause).exec(callback);
	},
	printAllFileRecords: function(){
		filesModel.find().exec(function (err, docs) {console.log(JSON.stringify(docs));});
	},
	printAllEmailRecords: function(){
		emailsModel.find().exec(function (err, docs) {console.log(JSON.stringify(docs));});
	},
	updateFilesModel: function(fileData, isDownload, isPlistUpdate, callback){
		if(!!fileData){
			if(!!fileData._id){
				if(!!isDownload){
					filesModel.findOne({_id: fileData._id}, 'fileVersionNumber totalDownloads lastDownloadedOn changeLog', function(err, file){
						if(err){
							return callback(err);
						}
						fileData.totalDownloads = (file.totalDownloads + 1);
						fileData.lastDownloadedOn = new Date();
						fileData.changeLog = file.changeLog;
						for(var i=0; i<fileData.changeLog.length; i++){
							if(fileData.changeLog[i].fileVersionNumber == file.fileVersionNumber){
								fileData.changeLog[i].totalDownloads = fileData.totalDownloads;
								fileData.changeLog[i].lastDownloadedOn = fileData.lastDownloadedOn;
								break;
							}
						}
						filesModel.update({_id: fileData._id}, fileData, function(err){
							if(!!err){
								return callback(err);
							}
							return callback(null, {_id: fileData._id, fileVersionNumber: fileData.fileVersionNumber});
						});
					});
				}
				else {
					filesModel.findOne({_id: fileData._id}, 'fileVersionNumber changeLog fileCreatedOn', function(err, file){
						if(err){
							return callback(err);
						}
						if(!isPlistUpdate){
							console.log("in findOne: " + file.fileVersionNumber);
							var fileVersionNumber = file.fileVersionNumber;
							fileData.fileVersionNumber = ++fileVersionNumber;
							var changeLog = fileData.changeLog;
							var fileChangeLog = JSON.parse(JSON.stringify(file.changeLog));
							console.log("final changelog: " + fileChangeLog);
							fileChangeLog.push({fileVersionNumber: fileData.fileVersionNumber, changeLog: changeLog});
							fileData.changeLog = fileChangeLog;
							if(!!file.fileCreatedOn)
								fileData.fileUpdatedOn = new Date();
							console.log("\n\nfile.fileCreatedOn: " + file.fileCreatedOn);
							console.log("fileData.fileUpdatedOn: " + fileData.fileUpdatedOn);
						}
						filesModel.update({_id: fileData._id}, fileData, function(err){
							if(!!err){
								return callback(err);
							}
							return callback(null, {_id: fileData._id, fileVersionNumber: fileData.fileVersionNumber});
						});
					});
				}
			}
			else{
				delete fileData._id;
				fileData.fileVersionNumber = 1;
				fileData.changeLog = {fileVersionNumber: fileData.fileVersionNumber, changeLog: fileData.changeLog};
				var newFile = new filesModel(fileData);
				newFile.save(function(err, fl){
					if(err){
						return callback(err);
					}
					console.log("returning fl._id: " + fl._id);
					return callback(null, {_id: fl._id, fileVersionNumber: fileData.fileVersionNumber});
				});
			}
		}
		else{
			callback("file related data cannot be blank!");
		}
	},
	prepareFileData: function(file, __getDateTimeToSend, __getFileSizeReadable){
		file = JSON.parse(JSON.stringify(file));
		if(!!file.changeLog && file.changeLog.length>0){
			file.changeLog = (file.changeLog).filter(function(fl){
				return (fl.fileVersionNumber==file.fileVersionNumber);
			});
			if(!!file.changeLog[0].changeLog && file.changeLog[0].changeLog!={}){
				file.changeLog = (file.changeLog[0].changeLog).split("|");
			}
			else {
				file.changeLog = null;
			}
		}
		if(!!file.fileCreatedOn)
			file.fileCreatedOn = __getDateTimeToSend(file.fileCreatedOn, true);
		if(!!file.fileUpdatedOn)
			file.fileUpdatedOn = __getDateTimeToSend(file.fileUpdatedOn, true);
		if(!!file.lastDownloadedOn)
			file.lastDownloadedOn = __getDateTimeToSend(file.lastDownloadedOn, true);
		if(!!file.fileDeletedOn)
			file.lastDownloadedOn = __getDateTimeToSend(file.lastDownloadedOn, true);
		if(!!file.fileSize){
			console.log("fileSize: " + file.fileSize);
			file.fileSize = __getFileSizeReadable({"size": file.fileSize, "unit": "bytes"});
			file.fileSize = file.fileSize.size + " " + file.fileSize.unit;
		}
		file.filePath += file._id + "/" + file.fileName;
		file.isapk = true;
		if(file.fileType=='ipa' && !!file.dependencies){
			file.isapk = false;
			file.filePath = "itms-services://?action=download-manifest&amp;url=" + file.dependencies.filePath + file._id + "/" + file.dependencies.fileName;
		}
		console.log("file: " + JSON.stringify(file));
		return file;
	},
	getFileListWithMetaData: function(isProduction, __getDateTimeToSend, __getFileSizeReadable, callback){
		var whereObj = {fileDeletedOn: null};
		if(isProduction!==undefined && isProduction!==null){
			whereObj.isProduction = isProduction;
		}
		filesModel.find(whereObj).select('_id fileName fileType filePath fileSize fileVersionNumber projectName projectDesc appVersionNumber fileCreatedBy fileUpdatedBy fileCreatedOn fileUpdatedOn changeLog dependencies totalDownloads lastDownloadedOn doNotDelete isProduction isDeleted fileDeletedOn').sort('-fileUpdatedOn').exec(function(err, files){
			if(!!err){
				return callback(err);
			}
			var fileList = JSON.parse(JSON.stringify(files));
			if(!!fileList && fileList.length>0){
				for(var i=0; i<fileList.length; i++){
					console.log("file: " + JSON.stringify(fileList[i]));
					if(!!fileList[i]){
						fileList[i] = modelFunctions.prepareFileData(fileList[i], __getDateTimeToSend, __getFileSizeReadable);
					}
				}
				return callback(err, fileList);
			}
			else{
				return callback("no file found", null);
			}
		});
	},
	getFileSize: function(id, callback){
		filesModel.findOne({_id: id}, 'fileSize', function(err, file){
			if(err){
				return callback(null);
			}
			console.log("latest file size print: " + JSON.stringify(file));
			return callback(file.fileSize);
		});
	},
	purge: function(cutoff, deleteFile){
		console.log('in purge: ' + new Date() + ' --cutoff: ' + cutoff);
		filesModel.find({fileUpdatedOn: {$lt: cutoff}, doNotDelete: false, isProduction: false},
			function (err, fileList) {
				if(err){
					console.log("error cronjob -purge -find: " + err);
				}
				if(!!fileList && fileList.length>0){
					fileList.forEach(
						function(file){
							file.filePath += file._id + "/" + file.fileName;
							deleteFile(file.filePath, function(err1){
								if(!!err1){
									console.log("error cronjob -purge -deleteFileCallbackRes: " + err1);
								}
								else{
									var _file = {isDeleted: true, fileDeletedOn: new Date()};
									filesModel.update({_id: file._id}, _file, null);
								}
							});
						}
					);
				}
			}
		);
	},
	updateEmailsModel: function(from, toList, ccList, subject, mailContent, fileId, fileVersionNumber, callback){
		var newEmail = new emailsModel({"fromEmailId": constants.fromEmailId, "from": from, "to": toList, "cc": ccList, "subject": subject, "mailContent": mailContent, "fileId": fileId, "fileVersionNumber": fileVersionNumber});
		newEmail.save(function(err, email){
			if(err){
				return callback({"error": err});
			}
			console.log("returning email._id: " + email._id);
			return callback("success");
		});
	},
	softDelete: function(fileData, userId, callback){
		filesModel.update({_id: fileData._id}, {isDeleted: true, fileDeletedBy: userId, fileDeletedOn: new Date()}, callback);
	},
	getFileDataBasedOnShortUrl: function(shortId, __getDateTimeToSend, __getFileSizeReadable, callback){
		console.log("shortId: " + shortId);
		filesModel.findOne({"shortId": shortId, "isDeleted": false}, '_id fileName fileType filePath fileSize fileVersionNumber projectName projectDesc appVersionNumber fileCreatedBy fileUpdatedBy fileCreatedOn fileUpdatedOn changeLog dependencies totalDownloads lastDownloadedOn doNotDelete isProduction isDeleted fileDeletedOn', function(err, file){
			if(err){
				return callback(null, err);
			}
			if(!!file){
				console.log("file: " + JSON.stringify(file));
				file = modelFunctions.prepareFileData(file, __getDateTimeToSend, __getFileSizeReadable);
				return callback(file);
			}
			return callback(null);
		});
	},
	getShortId: function(_id, callback){
		console.log("_id: " + _id);
		var shortId = burstShortId(_id);
		filesModel.update({"_id": _id}, {"shortId": shortId},
			function(err){
				if(!!err){
					callback(null, err);
				}
				callback(shortId);
			}
		);
	}
};


module.exports = modelFunctions;
