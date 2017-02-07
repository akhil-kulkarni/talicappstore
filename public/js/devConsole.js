var fileData = {
	"_id": null,
	"fileName": null,
	"fileSize": null,
	"fileCreatedBy": null,
	"fileUpdatedBy": null,
	"projectName": null,
	"appVersionNumber": null,
	"changeLog": null,
	"doNotDelete": false,
	"password": null,
	"isProduction": false
};

$(function () {
	$('#selectFile').fileupload({
		dataType: 'json',
		replacefileinput: true,
		add: function (e, data) {
			$('#cancelUpload').click(
				function(){
					data.abort();
					$("#cancelUpload").off("click");
				}
			);
			data.context = $('#uploadBtn').click(
				function(){
					data.formData = {
						"fileData": JSON.stringify(getFinalFileData())
					};
					console.log(data);
					data.submit();
					$("#uploadBtn").off("click");
				}
			);
		},
		progress: function (e, data) {
			var progress = parseInt(data.loaded / data.total * 100, 10);
			$('.progress-bar').css('width', (progress + '%'));
			$('.progress-bar').text((progress + '%'));
		},
		done: function (e, data) {
			$('.progress-bar').text("Uploaded Successfully!");
			if(!data.result.success)
				alert(data.result.msg || "could not upload the file!");
			else
				alert("File uploaded successfully!");
		},
		fail: function (e, data) {
			$('.progress-bar').text("Upload_Failed!");
			$('.progress-bar').css('width', ('0%'));
			alert("File upload failed!");
		}
	});
});

function getFinalFileData(){
	if(!!fileData){
		if(!fileData.fileCreatedBy){
			fileData.fileCreatedBy = (($('#uploaderName').val()||"").trim()) || null;
		}
		else{
			fileData.fileUpdatedBy = (($('#uploaderName').val()||"").trim()) || null;
		}
		fileData.projectName = (($('#projectName').val()||"").trim()) || null;
		fileData.appVersionNumber = (($('#appVersionNumber').val()||"").trim()) || null;
		fileData.changeLog = (($('#changeLog').val()||"").trim()) || null;
		if(!!fileData.changeLog){
			fileData.changeLog = fileData.changeLog.split("\n").join("|");
		}
		fileData.doNotDelete = $('#doNotDelete').prop('checked');
		fileData.isProduction = $('#isProduction').prop('checked');
		fileData.password = ____trI343fjjdl(fileData.fileName, ((($('#password').val()||"").trim()) || null));
	}
	return fileData;
}

function getFileSize(file){
	if(file.size<1024)
		return file;
	else {
		file.size = ((file.size)/1024).toFixed(2);
		if(file.unit==="bytes")
			file.unit = "KB";
		else if(file.unit==="KB")
			file.unit = "MB";
		else if(file.unit==="MB")
			file.unit = "GB";
		else
			file.unit = null;
		return getFileSize(file);
	}
}

$(document).on('click', '#cancelUpload', function(){
	$('#selectFile').stop();
});

$(document).on('change', '#selectFile', function(e){
	console.log("e.target.files.length: " + JSON.stringify(e.target.files));
	var selectedFile = e.target.files[0];
	$('#fileName').text(selectedFile.name);
	var fileSize = getFileSize({"size": selectedFile.size, "unit": "bytes"});
	$('#fileSize').text("size: " + fileSize.size + " " + fileSize.unit);
	$('.progress-bar').css('width', (0 + '%'));
	$('.progress-bar').text('');
	$('.upload-file').show();
	fileData.fileName = selectedFile.name;
	fileData.fileSize = selectedFile.size;
});
