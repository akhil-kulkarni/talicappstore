var express = require("express");
var exphbs  = require('express-handlebars');
var session = require('express-session');
var mongoose = require('mongoose');
var busboy = require('connect-busboy'); //middleware for form/file upload
var bodyParser = require("body-parser");
var constants = require('./constants.js');
var db = require('./models/db.js');
var commonFunctions = require('./common/commonFunctions.js');

var app = express();
var config = commonFunctions.config();

app.set('port', (process.env.app_port || 8081));
app.use(busboy());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

commonFunctions.startCronJobs();

var hbs = exphbs.create({
	helpers: {
		json: function(val){ return JSON.stringify(val);},
		paddedInc: function(val){ var pi = parseInt(val) + 1; if(pi<10) return "0"+pi; else return pi+"";},
		trclr: function(val){ return ((val%2===0)?"info":"active"); },
		apphdrclr: function(val){ if(!!val){val = parseInt(val); return ("app-header-" + ((val%5)+1));} return "app-header-1";}
	},
	defaultLayout: 'main',
	layoutsDir:  __dirname + '/views/layouts',
	partialsDir: [ __dirname + '/views/partials'],
	extname: '.hbs'
});
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', __dirname + '/views/partials');

app.use(session({"secret": config.sessionSecret}));

app.use(function(req, res, next) {
	res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
});

var userSession;

app.get('/', function(req, res) {
	userSession = req.session;
	var fileRes = {};
	commonFunctions.getFileListWithMetaData(false, function(err, filesArr){
		console.log("fileRes: " + JSON.stringify(filesArr));
		fileRes.loggedInAs = userSession.username || null;
		fileRes.files = filesArr || null;
		fileRes.isNotDownloadLink = true;
		fileRes.pageName = constants.defaultPageName;
		fileRes.isAppStore = true;
		res.render('appStore', {"file": fileRes});
	});
});

app.get('/prod', function(req, res) {
	userSession = req.session;
	var fileRes = {};
	commonFunctions.getFileListWithMetaData(true, function(err, filesArr){
		console.log("fileRes: " + JSON.stringify(filesArr));
		fileRes.loggedInAs = userSession.username || null;
		fileRes.files = filesArr || null;
		fileRes.isNotDownloadLink = true;
		fileRes.pageName = constants.defaultPageName;
		fileRes.isAppStore = true;
		res.render('appStore', {"file": fileRes});
	});
});

app.get('/downloads/:id', function(req, res) {
	commonFunctions.getFileDataBasedOnShortUrl(req.params.id, function(filesArr, err){
		if (err) { throw(err); }
		filesArr.files = ((!!filesArr)?[filesArr]:null);
		filesArr.isNotDownloadLink = false;
		filesArr.pageName = constants.defaultPageName;
		filesArr.isAppStore = true;
		res.render('appStore', {"file": filesArr});
	});
});

app.get('/devConsole', function(req, res) {
	userSession = req.session;
	if(!!userSession.username){
		var fileRes = {};
		commonFunctions.getFileListWithMetaData(null, function(err, files){
			if(!!err){
				res.render('devConsole', {"file": {pageName: "developer console", loggedInAs: userSession.username, isNotDownloadLink: true, isAppStore: false}});
			}
			else{
				fileRes.loggedInAs = userSession.username;
				fileRes.isNotDownloadLink = true;
				fileRes.pageName = "developer console";
				fileRes.isAppStore = false;
				fileRes.files = files;
				res.render('devConsole', {"file": fileRes});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

app.post("/login", function(req, res){
	if(!!req && !!req.body && !!req.body.password && !!req.body.username){
		console.log("req.body.username: " + req.body.username);
		if(req.body.username=="dev" || req.body.username=="admin"){
			commonFunctions.getLoginModelCount({"username": req.body.username, "password": req.body.password},
				function(err, count){
					if(err){
						res.json({error: true, msg: "User does not exist!"});
					}
					if(count===1){
						userSession = req.session;
						userSession.username = req.body.username;
						res.json({error: false, render: "devConsole"});
					}
					else{
						res.json({error: true, msg: "Invalid Credentials!"});
					}
				}
			);
		}
		else{
			console.log("invalid credentials!");
			res.json({error: true, msg: "User does not exist!"});
		}
	}
	else{
		console.log("something is undefined or null!");
		res.json({error: true, msg: "something is undefined or null!"});
	}
});

app.post('/upload', function(req, res) {
	var fstream;
	console.log("attempt made to upload file...");
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		console.log("Uploading: " + filename);
		commonFunctions.saveFile(file, filename, function(resp){
			console.log("req.body.fileData: " + JSON.stringify(req.body.fileData));
			if(!!resp && resp.success){
				if(!!req.body.fileData){
					req.body.fileData.fileType = req.body.fileData.fileType || commonFunctions.getFileExt(req.body.fileData.fileName);
					req.body.fileData.filePath = req.body.fileData.filePath || (constants.uploadsFolderPath + "/" + req.body.fileData.fileType + "/");
					commonFunctions.updateFilesModel(req.body.fileData, false, false, function(err, updFileModelRes){
						if(err){
							console.log("updateFilesModel updFileModelRes err: " + err);
						}
						else{
							if(!!updFileModelRes && !!updFileModelRes._id){
								req.body.fileData._id = updFileModelRes._id;
							}
							commonFunctions.saveOrUpdatePLISTFile(req.body.fileData, function(error, plistRes){
								if(error){
									res.json({success: false, msg: error});
								}
								else{
									 if(!!plistRes && plistRes!=="success"){
										 //ipa file
										req.body.fileData.dependencies = plistRes;
									}
									commonFunctions.updateFilesModel(req.body.fileData, false, true, function(err, updateRes){
										if(err){
											console.log("updateFilesModel err: " + err);
										}
										else{
											files = [{},{}];
											files[0]._id = updateRes._id;
											files[0].fileName = req.body.fileData.fileName;
											files[0].filePath = req.body.fileData.filePath;
											if(req.body.fileData.fileType==="ipa"){
												files[1].fileName = req.body.fileData.dependencies.fileName;
												//using the ipa file path instead of dependencies path as the dependencies path will have the site url in it instead of the actual location of the file.
												files[1].filePath = req.body.fileData.filePath;
											}
											commonFunctions.moveFiles(files, function(err, msg){
												if(!!err){
													res.json({success: false, msg: err});
												}
												else{
													res.json({success: true, msg: updateRes});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			}
			else{
				res.json(resp);
			}
		});
	});
	req.busboy.on('field', function(fieldname, val) {
		console.log("field: ");
		req.body[fieldname] = JSON.parse(val);
	});
	req.busboy.on('finish', function(){
		// things to be done after handling the file
	});
});

app.get("/download", function(req, res){
	var file = req.query;
	console.log("download file request: " + JSON.stringify(file));
	if(!!file && !!file._id){
		commonFunctions.updateFilesModel(JSON.parse(JSON.stringify(file)), true, false, function(err, msg){
			if(!!err){
				console.log("error updating download file details: " + err);
				res.json({"success": false, "err": "Unable to download file!"});
			}
			else{
				if(!file.isipa){
					commonFunctions.downloadFile(file.filePath, file._id, res);
				}
				else{
					res.json({"success": true});
				}
			}
		});
	}
	else{
		console.log("file id not provided!");
		res.json({"success": false, "err": "Unable to download file!"});
	}
});

app.post('/sendUploadMail', function(req, res){
	if(!!req && !!req.body){
		console.log("req.body.isProduction isProduction: " + req.body._id);
		commonFunctions.getShortId(req.body._id, function(shortId, err){
			if(!!err){console.log("err sendUploadMail: " + err); res.json(null);}
			commonFunctions.sendUploadMail(req.body.from || "Anonymous", req.body.toList, req.body.ccList, req.body.projectName, req.body.projectDesc, shortId, req.body.changeLog, (req.body.isProduction==="true"), function(response){
				if(!response.error){
					commonFunctions.updateEmailsModel(req.body.from || "Anonymous", req.body.toList, req.body.ccList, response.subject, response.mailContent, req.body._id, req.body.fileVersionNumber, function(resp){
						return res.json(resp);
					});
				}
				else{
					return res.json(response);
				}
			});
		});
	}
	else{
		res.json({error: "mail data missing not available"});
	}
});

app.get('/logout',function(req,res){
	req.session.destroy(function(err) {
		if(err) {
			console.log(err);
		}
		else {
			res.redirect('/');
		}
	});
});

app.post('/deleteBuild', function(req, res){
	userSession = req.session;
	commonFunctions.softDelete(req.body.file,userSession.username,function(err){
		if(!!err){
			res.send(err);
		}
		else{
			res.send("success");
		}
	});
});
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
