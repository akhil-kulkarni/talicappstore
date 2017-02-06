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
			data.formData = {
				"fileData": JSON.stringify({
					"appVersionNumber": "1.3.4",
					"changeLog": "so and so .... adfsf ... ",
					"doNotDelete": false,
					"password": null,
					"isProduction": false
				})
			};
			data.context = $('#uploadBtn').click(
				function(){
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
	$('.uploadFile').show();
});
