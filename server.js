var express = require("express");
var mustacheExpress = require("mustache-express");
var multer = require("multer");

var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation

var app = express();

app.set('port', (process.env.PORT || 8081));
app.use(busboy());
app.use(express.static(__dirname + '/public'));

app.engine('html', mustacheExpress());
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(request, response) {
	response.render('devHome.html');
});

app.post('/test', function(req, res) {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
		console.log("Uploading: " + filename);

		var uploadRoot = "/uploads";
		var uploadPath = "/garbage";

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
		}

		console.log("fname: " + fname);
		console.log("fext: " + fext);


		if(!!fext && (fext=="apk" || fext=="ipa"))
			uploadPath = uploadRoot + "/" + fext;


		if (!fs.existsSync("uploads")){
			fs.mkdirSync("uploads");
		}

		if (!fs.existsSync("uploads/apk")){
			fs.mkdirSync("uploads/apk");
		}

		if (!fs.existsSync("uploads/ipa")){
			fs.mkdirSync("uploads/ipa");
		}

		if (!fs.existsSync("uploads/garbage")){
			fs.mkdirSync("uploads/garbage");
		}

		//Path where apk/ipa will be uploaded
		fstream = fs.createWriteStream(__dirname + uploadPath + "/" + filename);
		file.pipe(fstream);
		fstream.on('close', function () {
			console.log("Upload Finished of " + filename);
			res.redirect('back');           //where to go next
		});
	});
	console.log("received a hit");
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
