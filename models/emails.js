var mongoose = require("mongoose");

var emailsSchema = new mongoose.Schema({
	fromEmailId: String,
	from: String,
	to: String,
	cc: String,
	bcc: String,
	attachments:[{
		fileName: String,
		fileSize: String
	}],
	subject: String,
	mailContent: String,
	mailSentOn: {type: Date, default: new Date()},
	fileId: String,
	fileVersionNumber: String
}, {collection: "emailsCollection", timestamps: true});

module.exports = mongoose.model('emails', emailsSchema);
