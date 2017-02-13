var mongoose = require("mongoose");

var filesSchema = new mongoose.Schema({
	fileName: String,
	filePath: String,
	fileSize: {type: Number, default: 0}, // size of the file in bytes
	fileType: String,
	fileVersionNumber: {type: Number, default: 1},
	projectName: String,
	projectDesc: String,
	appVersionNumber: String, // user input
	fileCreatedBy: String,
	fileUpdatedBy: String,
	fileDeletedBy: String, // admin or scheduler
	fileCreatedOn: {type: Date, default: Date.now},
	fileUpdatedOn: {type: Date, default: Date.now},
	fileDeletedOn: Date,
	changeLog: [{
		fileVersionNumber: {type: Number, default: 1},
		fileCreatedOn: {type: Date, default: Date.now},
		lastDownloadedOn: Date,
		totalDownloads: {type: Number, default: 0},
		changeLog: String // user input
	}],
	lastDownloadedOn: Date,
	totalDownloads: {type: Number, default: 0},
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
