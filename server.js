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

var hbs = exphbs.create({
	helpers: {
		json: function(val){ return JSON.stringify(val);},
		inc: function(val){ return parseInt(val) + 1; },
		trclr: function(val){ return ((val%2===0)?"info":"active"); }
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

var userSession;

// commonFunctions.sendMail('John Cena', "Test Mail", "klkrni.akhil@gmail.com", null, "<b>Hello Again! WWE Rocks...</b>", function(){
// 	console.log("send mail callback");
// });

app.get('/', function(req, res) {
	userSession = req.session;
	var fileRes = {};
	commonFunctions.getFileListWithMetaData(false, function(err, filesArr){
		console.log("fileRes: " + JSON.stringify(filesArr));
		fileRes.loggedInAs = userSession.username || null;
		fileRes.files = filesArr || null;
		res.render('TalicAppStore', {"file": fileRes});
	});
});

app.get('/prod', function(req, res) {
	userSession = req.session;
	var fileRes = {};
	commonFunctions.getFileListWithMetaData(true, function(err, filesArr){
		console.log("fileRes: " + JSON.stringify(filesArr));
		fileRes.loggedInAs = userSession.username || null;
		fileRes.files = filesArr || null;
		res.render('TalicAppStore', {"file": fileRes});
	});
});

app.get('/devConsole', function(req, res) {
	userSession = req.session;
	if(!!userSession.username){
		commonFunctions.getFileListWithMetaData(null, function(err, fileRes){
			if(!!err){
				res.render('devConsole', {"file": null});
			}
			else{
				fileRes.loggedInAs = userSession.username;
				res.render('devConsole', {"file": fileRes});
			}
		});
	}
	else{
		res.redirect('/');
	}
});

app.post("/login", function(req, res){
	if(!!res && !!req.body && !!req.body.password && !!req.body.username){
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
					commonFunctions.saveOrUpdatePLISTFile(req.body.fileData, function(error, plistRes){
						if(error){
							res.json({success: false, msg: error});
						}
						else{
							 if(!!plistRes && plistRes!=="success"){
								 //ipa file
								req.body.fileData.dependencies = plistRes;
							}
							commonFunctions.updateFilesModel(req.body.fileData, false, function(err, updateRes){
								if(err){
									console.log("updateFilesModel err: " + err);
									res.json({success: false, msg: err});
								}
								else{
									res.json({success: true, msg: "upload success"});
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
		req.body[fieldname] = JSON.parse(val);
	});
	req.busboy.on('finish', function(){
		// things to be done after handling the file
	});
});

app.get("/download", function(req, res){
	var file = req.query.filePath;
	console.log("req.body.filePath: " + JSON.stringify(req.query));
	if(!!file){
		commonFunctions.updateFilesModel(req.query, true, function(err, msg){
			if(!!err){
				console.log("error updating download file details: " + err);
				res.json({"success": false, "err": "Unable to download file!"});
			}
			if(!req.query.isipa){
				commonFunctions.downloadFile(file, res);
			}
			else{
				res.json({"success": true});
			}
		});
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
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
