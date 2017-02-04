var express = require("express");
var mustacheExpress = require("mustache-express");
var multer = require("multer");

var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation
var mime = require('mime');

var app = express();

app.set('port', (process.env.app_port || 8081));
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

		var uploadsFolderName = "public/uploads";
		var uploadsSubFolderName = "public/uploads/garbage";

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
			uploadsSubFolderName = uploadsFolderName + "/" + fext;

		if (fs.existsSync("uploads")){
			fs.remove("uploads", function (err) {
				if (err) {
					console.error(err);
				}
			});
		}

		if (!fs.existsSync(uploadsFolderName)){
			fs.mkdirSync(uploadsFolderName);
		}

		if (!fs.existsSync(uploadsSubFolderName)){
			fs.mkdirSync(uploadsSubFolderName);
		}

		//Path where apk/ipa will be uploaded
		fstream = fs.createWriteStream(__dirname + "/" + uploadsSubFolderName + "/" + filename);
		file.pipe(fstream);
		fstream.on('close', function () {
			console.log("Upload Finished of " + filename);
			res.redirect('back');           //where to go next
		});
	});
	console.log("received a hit");
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
