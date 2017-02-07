var express = require("express");
var mustacheExpress = require("mustache-express");

var mongoose = require('mongoose');

var busboy = require('connect-busboy'); //middleware for form/file upload

var bodyParser = require("body-parser");
var app = express();

var constants = require('./constants.js');
var db = require('./models/db.js');
var commonFunctions = require('./common/commonFunctions.js');
var modelFunctions = require('./common/modelFunctions.js');

modelFunctions.printAllFileRecords();

var config = commonFunctions.config();

app.set('port', (process.env.app_port || 8081));
app.use(busboy());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.engine('html', mustacheExpress());
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(request, response) {
	response.render('TalicAppStore.html');
});

app.get('/devConsole', function(request, response) {
	response.render('devConsole.html');
});

app.post("/login", function(req, res){
	if(!!res && !!req.body && !!req.body.password && !!req.body.username){
		console.log("req.body.username: " + req.body.username);
		if(req.body.username=="dev" || req.body.username=="admin"){
			modelFunctions.getLoginModelCount({"username": req.body.username, "password": req.body.password},
				function(err, count){
					if(err){
						res.json({error: true, msg: "User does not exist!"});
					}
					if(count===1){
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
				modelFunctions.updateFilesModel(req.body.fileData, function(err, updateRes){
					if(err){
						console.log("updateFilesModel err: " + err);
						res.json({success: false, msg: err});
					}
					res.json({success: true, msg: "upload success"});
				});
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
		// console.log("currTimestamp: " + currTimestamp);
		// console.log("req.body.fileData: " + JSON.stringify(req.body.fileData));
		// commonFunctions.updateFilesModel(req.body.fileData, currTimestamp);
	});
});

app.get("/download", function(req, res){
	var file = __dirname + '/public/uploads/apk/GoodConnect.apk';
	if(!!file){
		var filename = path.basename(file);
		var mimetype = mime.lookup(file);
		console.log("mimetype: " + mimetype);
		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		res.setHeader('Content-type', mimetype);
		var filestream = fs.createReadStream(file);
		filestream.pipe(res);
	}
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
