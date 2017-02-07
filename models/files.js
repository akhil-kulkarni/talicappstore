var mongoose = require("mongoose");
var commonFunctions = require("../common/commonFunctions");
var config = commonFunctions.config();

var filesSchema = new mongoose.Schema({
	fileName: String,
	filePath: String,
	fileSize: Number, // size of the file in bytes
	fileType: String,
	fileVersionNumber: Number, // signifies number of times a particular file was uploaded
	projectName: String,
	appVersionNumber: String, // user input
	fileCreatedBy: String,
	fileUpdatedBy: String,
	fileDeletedBy: String, // admin or scheduler
	fileCreatedOn: {type: Date, default: Date.now},
	fileUpdatedOn: {type: Date, default: Date.now},
	fileDeletedOn: Date,
	changeLog: [{
		fileVersionNumber: Number,
		fileCreatedOn: {type: Date, default: Date.now},
		changeLog: String // user input
	}],
	lastDownloadedOn: Date,
	totalDownloads: Number,
	doNotDelete: {type: Boolean, default: false}, // user input
	password: String, // user input
	isProduction: {type: Boolean, default: false}, // user input
	dependencies: {
		fileName: String,
		filePath: String,
		fileType: String,
		filePurpose: String
	}
}, {collection: "filesCollection", timestamps: true});

module.exports = mongoose.model('files', filesSchema);
