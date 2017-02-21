var crypto = require('crypto');
var nodemailer = require('nodemailer');
var constants = require('../constants.js');
var env = require('../env.json');
var path = require('path'); //used for file path
var fs = require('fs-extra'); //File System - for file manipulation
var mime = require('mime');
var modelFunctions = require('./modelFunctions.js');
var xoauth2 = require('xoauth2');
var ipaMetadata = require('ipa-metadata');
var CronJob = require('cron').CronJob;

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
	updateFilesModel: function(fileData, isDownload, callback){
		if(!!fileData){
			if(!!isDownload && ("filePath" in fileData)){
				// delete fileData.filePath so as to not overwrite path during download
				delete fileData.filePath;
			}
			modelFunctions.updateFilesModel(fileData, isDownload, callback);
		}
		else{
			return callback("file data cannot be blank!");
		}
	},
	printAllFileRecords: function(){
		modelFunctions.printAllFileRecords();
	},
	printAllEmailRecords: function(){
		modelFunctions.printAllEmailRecords();
	},
	getFileListWithMetaData: function(isProduction, callback){
		modelFunctions.getFileListWithMetaData(isProduction, this.getDateTimeToSend, this.getFileSizeReadable, callback);
	},
	ifCondHelper: function(v1, operator, v2, itms, options){
		console.log("itms: " + itms);
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
	getTZISOString: function(dateISO, offset){
		// expects timezone offset as parameter - default: IST(Indian Standard Time) = (-330), default date will be new Date()
		if(!dateISO)
			dateISO = new Date();
		else
			dateISO = new Date(dateISO);
		offset = offset || (-330);
		var tzISOString = (new Date((dateISO.getTime())-((offset) * (60) * (1000)))).toISOString();
		return tzISOString;
	},
	getDateTimeToSend: function(tzISOString, tzConversionNeeded){
		// expects Date - ISO string as parameter. If not provided will return current date & time in IST.
		if(!tzISOString){
			tzISOString = commonFunctions.getTZISOString();
		}
		else if(!!tzConversionNeeded){
			console.log("tzISOString: " + tzISOString);
			tzISOString = commonFunctions.getTZISOString(tzISOString);
		}
		var isoArr = tzISOString.replace("Z","").split("T");
		var isoDateArr = isoArr[0].split("-");
		var finalString = isoDateArr[2] + "-" + isoDateArr[1] + "-" + isoDateArr[0] + " " + (isoArr[1].split("."))[0];
		return finalString;
	},
	downloadFile: function(file, id, res){
		console.log("file: " + file);
		var filename = path.basename(file);
		var mimetype = mime.lookup(file);
		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		res.setHeader('Content-type', mimetype);
		modelFunctions.getFileSize(id, function(size){
			console.log("download file size: " + size);
			if(!!size)
				res.setHeader('Content-Length', size);
			var filestream = fs.createReadStream(file);
			filestream.pipe(res);
		});
	},
	getFileSizeReadable: function(file){
		if(file.size<1024)
			return file;
		else {
			file.size = ((file.size)/1024).toFixed(2);
			if(file.unit==="bytes")
				file.unit = "KB";
			else if(file.unit==="KB")
				file.unit = "MB";
			else if(file.unit==="MB")
				file.unit = "GB";
			else
				file.unit = null;
			return commonFunctions.getFileSizeReadable(file);
		}
	},
	getNMTransporter: function(){
		return nodemailer.createTransport({
			service: 'gmail',
			auth: {
				xoauth2: xoauth2.createXOAuth2Generator(constants.oAuth2Config)
			}
		});
	},
	sendMail: function(from, subject, mailingList, ccList, mailContent, callback){
		var mailOptions = {
			from: ((from || "Tabsales Dev Team") + ' <' + 'akhil16.4.93@gmail.com' + '>'), // sender address
			to: mailingList, // comma separated list or array of receivers
			cc: ccList, // comma separated list or array of receivers
			subject: (subject || 'Important Announcement!'),
			//text: 'text', // plaintext body
			html: (mailContent || '<b>Hello!</b>') // You can choose to send an HTML body instead
		};
		commonFunctions.getNMTransporter().sendMail(mailOptions, function(error, info){
			if(error){
				console.log(error);
				callback(error);
			}
			else{
				console.log('Message sent: ' + info.response);
				callback(null, info);
			}
		});
	},
	getFileNameWithoutExt: function(fileName) {
		if(!!fileName){
			var flArr = fileName.split(".");
			fileName = "";
			for(var i=0; i<(flArr.length-1); i++){
				fileName += flArr[i];
			}
		}
		return fileName || null;
	},
	saveOrUpdatePLISTFile: function(fileData, callback){
		if(!!fileData && fileData.fileType==="ipa"){
			ipaMetadata((fileData.filePath + fileData.fileName), function(error, data){
				data = data.metadata;
				var plist = constants.plistTemplate;
				plist = plist.replace("||URL||", (commonFunctions.config().siteURL + "/uploads/ipa/" + fileData._id + "/" + fileData.fileName));
				plist = plist.replace("||BUNDLE_IDENTIFIER||", data.CFBundleIdentifier);
				plist = plist.replace("||TITLE||", data.CFBundleName);
				plist = plist.replace("||VERSION_NO||", data.CFBundleVersion);
				if (!fs.existsSync(constants.uploadsFolderPath)){
					fs.mkdirSync(constants.uploadsFolderPath);
				}

				if (!fs.existsSync(constants.uploadsFolderPath + "/ipa")){
					fs.mkdirSync(constants.uploadsFolderPath + "/ipa");
				}

				var plistRes = {};
				var filePathForSaving = constants.uploadsFolderPath + "/ipa/";
				plistRes.fileType = "plist";
				plistRes.fileName = commonFunctions.getFileNameWithoutExt(fileData.fileName) + "." + plistRes.fileType;
				plistRes.filePath = commonFunctions.config().siteURL + "/uploads/ipa/";
				plistRes.filePurpose = "to download and install the ipa on iOS devices";
				fs.writeFile(filePathForSaving + plistRes.fileName, plist, function(err) {
					if(err) {
						console.log("error saving plist: " + err);
						return callback(err);
					}
					callback(null, plistRes);
				});
			});
		}
		else {
			callback(null, "success");
		}
	},
	moveFiles: function(files, callback){
		if(!!files && files.length>0){
			if (!fs.existsSync(files[0].filePath + files[0]._id)){
				console.log("making dir: " + files[0].filePath + files[0]._id);
				fs.mkdirSync(files[0].filePath + files[0]._id);
			}
			var srcFile = fs.createReadStream(files[0].filePath + files[0].fileName);
			var destFile = fs.createWriteStream(files[0].filePath + files[0]._id + "/" + files[0].fileName);
			srcFile.pipe(destFile);

			srcFile.on('end', function() {
				console.log("file copied successfully");
				fs.exists(files[0].filePath + files[0].fileName, function(exists) {
					if(exists) {
						//Show in green
						fs.unlink(files[0].filePath + files[0].fileName);
					} else {
						//Show in red
						console.log('File not found, so not deleting.');
					}
				});
				if(!!files[1] && !!files[1].filePath){
					console.log("srcFilePl: " + files[1].filePath + files[1].fileName);
					var srcFilePl = fs.createReadStream(files[1].filePath + files[1].fileName);
					var destFilePl = fs.createWriteStream(files[1].filePath + files[0]._id + "/" + files[1].fileName);
					srcFilePl.pipe(destFilePl);
					srcFilePl.on('end', function() {
						fs.exists(files[1].filePath + files[1].fileName, function(exists) {
							if(exists) {
								//Show in green
								fs.unlink(files[1].filePath + files[1].fileName);
							} else {
								//Show in red
								console.log('File not found, so not deleting.');
							}
						});
						callback(false, "file copy successful!");
					});
					srcFilePl.on('error', function(err) { callback(true, "file copy failed!"); });
				}
				else{
					callback(false, "file copy successful!");
				}
			});
			srcFile.on('error', function(err) { console.log("file upload failed: " + err); callback(true, "file copy failed!"); });
		}
	},
	deleteFile: function(filePath, callback){
		fs.exists(filePath, function(exists) {
			if(exists){
				fs.unlink(filePath,function(err){
					if(err) return callback(err);
					else return callback();
				});
			}
			else{
				callback("file does not exist!");
			}
		});
	},
	purge: function(){
		var cutoff = new Date();
		cutoff.setDate(cutoff.getDate()-10);
		modelFunctions.purge(cutoff, commonFunctions.deleteFile);
	},
	startCronJobs: function(){
		console.log("starting cron jobs");
		try{
			var purge = new CronJob({
				cronTime: '00 00 00 * * 0-6',
				onTick:  function() {
					// every night at 00:00:00
					console.log("purge job ticked at " + new Date());
					commonFunctions.purge(new Date());
				},
				start: true,
				timeZone: 'Asia/Kolkata'
			});
		}
		catch(ex){
			console.log("Invalid cron time!");
		}
	},
	isEmailIdInvalid: function(email){
		return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
	},
	validateEmailList: function(toList, ccList, callback){
		console.log("toList: " + toList);
		var invalidEmailId = null;
		var i=0;
		if(!!toList && (toList.length>0)){
			for(i=0; i<toList.length; i++){
				toList[i] = (!!toList[i])?(toList[i].trim()):toList[i];
				if(!commonFunctions.isEmailIdInvalid(toList[i])){
					invalidEmailId = toList[i];
					break;
				}
			}
			if(!invalidEmailId && !!ccList && (ccList.length>0)){
				for(i=0; i<ccList.length; i++){
					ccList[i] = (!!ccList[i])?(ccList[i].trim()):ccList[i];
					if(!commonFunctions.isEmailIdInvalid(ccList[i])){
						invalidEmailId = ccList[i];
						break;
					}
				}
			}
			if(!!invalidEmailId){
				callback(invalidEmailId + " is an invalid email id!");
			}
			else{
				callback();
			}
		}
	},
	sendUploadMail: function(from, toList, ccList, projectName, projectDesc, changeLog, isProduction, callback){
		if(!!toList){
			if(!!projectName && !!projectDesc){
				commonFunctions.validateEmailList(toList, ccList, function(err){
					if(!!err){
						return callback({error: err});
					}

					if(!!changeLog){
						changeLog = changeLog.split("\n").join("</li><li>");
						changeLog = "<div style='margin-left: 10px;'><ol><li>" + changeLog + "</li></ol></div>";
					}
					else{
						changeLog = "Not available.";
					}
					console.log("sendUploadMail isProduction: " + !!isProduction);
					var uploadMailTemplate = constants.uploadMailTemplate.replace("||projectName||", projectName);
					uploadMailTemplate = uploadMailTemplate.replace("||projectDesc||", projectDesc);
					uploadMailTemplate = uploadMailTemplate.replace("||changeLog||", changeLog);
					uploadMailTemplate = uploadMailTemplate.split("||siteURL||").join( (!!isProduction)?(commonFunctions.config().siteURL+"/prod"):commonFunctions.config().siteURL);

					commonFunctions.sendMail(from, "New build: " + projectName, toList.join(), ((!!ccList)?ccList.join():null), uploadMailTemplate, function(){
						return callback({"mailContent": uploadMailTemplate, "subject": "New build: " + projectName});
					});
				});
			}
			else if(!projectName){
				return callback({error: "project name cannot be empty"});
			}
			else if(!projectDesc){
				return callback({error: "project description cannot be empty"});
			}
		}
		else{
			return callback({error: "'to' list cannot be empty"});
		}
	},
	updateEmailsModel: function(from, toList, ccList, subject, mailContent, fileId, fileVersionNumber, callback){
		modelFunctions.updateEmailsModel(from, toList, ccList, subject, mailContent, fileId, fileVersionNumber, function(res){
			commonFunctions.printAllEmailRecords();
			return callback(res);
		});
	},
	emptyDir: function(filePath, callback){
		fs.exists(filePath, function(exists) {
			if(exists){
				fs.emptyDir(filePath,function(err){
					if(err) return callback(err);
					else return callback();
				});
			}
			else{
				callback("file does not exist!");
			}
		});
	}
};

module.exports = commonFunctions;
