
var mongoose = require("mongoose");
var mongoose = require("../common/commonFunctions");
var config = commonFunctions.config();

//connect to database
var db = mongoose.connect(config.mongodb);

var filesSchema = new mongoose.Schema({
	fileName: String,
	filePath: String,
	fileSize: String,
	fileVersionNumber: Number, // signifies number of times a particular file was uploaded
	appVersionNumber: Number, // user input
	createdBy: String,
	updatedBy: String,
	deletedBy: String, // admin or scheduler
	createdOn: Date,
	updatedOn: Date,
	deletedOn: Date,
	changeLog: [{
		fileVersionNumber: String,
		changeLog: String // user input
	}],
	lastDownloadedOn: Date,
	totalDownloads: Number,
	doNotDelete: Boolean, // user input
	password: String, // user input
	isProduction: Boolean, // user input
	dependencies: {
		fileName: String,
		filePath: String,
		fileType: String,
		filePurpose: String
	}
}, {collection: "filesCollection"});

var filesModel = mongoose.model('files', fileListSchema);
