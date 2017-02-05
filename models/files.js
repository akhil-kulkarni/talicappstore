/*

1. File Name
2. File Path
3. Created By
4. Updated By
5. Created On
6. Updated On
7. File Size
8. Changelog
9. Dependencies
	1. File Name
	2. File Path

*/

var mongoose = require("mongoose");
var config = commonFunctions.config();

//connect to database
var db = mongoose.connect(config.mongodb);

var filesSchema = new mongoose.Schema({
	fileName: String,
	filePath: String,
	createdBy: String,
	updatedBy: String,
	createdOn: Date,
	updatedOn: Date,
	fileSize: String,
	changeLog: String,
	dependencies: {
		fileName: String,
		filePath: String
	}
}, {collection: "filesCollection"});

var filesModel = mongoose.model('files', fileListSchema);
