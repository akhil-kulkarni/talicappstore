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
					if(!$('#projectName').val()){
						alert("Please enter a project name.");
					}else{
						data.formData = {
							"fileData": JSON.stringify(getFinalFileData())
						};
						console.log(data);
						data.submit();
					}
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
			if(!data.result.success){
				$('.progress-bar').text("Upload Failed!");
				alert(JSON.stringify(data.result.msg) || "could not upload the file!");
			}
			else{
				$('.progress-bar').text("Uploaded Successfully!");
				if(!alert("File uploaded successfully!")){window.location.reload();}
			}
		},
		fail: function (e, data) {
			$('.progress-bar').text("Upload_Failed!");
			$('.progress-bar').css('width', ('0%'));
			alert("File upload failed!");
		}
	});
});

function getFinalFileData(){
	// if(!!fileData){
	var fileData = {};
		if(!!$('#_id').val()){
			fileData._id = $('#_id').val();
		}
		if(!$('#fileCreatedBy').val()){
			fileData.fileCreatedBy = (($('#uploaderName').val()||"").trim()) || null;
		}
		else{
			fileData.fileUpdatedBy = (($('#uploaderName').val()||"").trim()) || null;
		}
		if(!!$('#fileName').val()){
			fileData.fileName = (($('#fileName').val()||"").trim()) || null;
		}
		if(!!$('#fileSize').val()){
			fileData.fileSize = (($('#fileSize').val()||"").trim()) || "";
		}
		fileData.projectName = (($('#projectName').val()||"").trim()) || null;
		fileData.appVersionNumber = (($('#appVersionNumber').val()||"").trim()) || null;
		fileData.changeLog = (($('#changeLog').val()||"").trim()) || null;
		if(!!fileData.changeLog){
			fileData.changeLog = fileData.changeLog.split("\n").join("|");
		}
		fileData.totalDownloads = 0;
		fileData.lastDownloadedOn = null;
		fileData.doNotDelete = $('#doNotDelete').prop('checked');
		fileData.isProduction = $('#isProduction').prop('checked');
		fileData.password = ____trI343fjjdl(fileData.fileName, ((($('#password').val()||"").trim()) || null));
	// }
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
	$('#fileName').val(selectedFile.name);
	$('#fileSize').val(selectedFile.size);
});

$(document).on('show.bs.collapse', '.collapse', function(event) {
	$('.collapse.in').collapse('hide');
});

function showUploadBox(){
	$('#addBtn i').removeClass('fa-plus').addClass('fa-close');
	$('#addBtn').removeClass('btn-success').addClass('btn-danger');
	$('#_id').val(null);
	$('#fileCreatedBy').val(null);
	$('#fileName').val(null);
	$('#fileSize').val(null);
	$('#uploadForm')[0].reset();
	$('#uploadBox').show();
}

function hideUploadBox(){
	$('#addBtn i').removeClass('fa-close').addClass('fa-plus');
	$('#addBtn').removeClass('btn-danger').addClass('btn-success');
	$('#uploadBox').hide();
	$('#_id').val(null);
	$('#fileCreatedBy').val(null);
	$('#fileName').val(null);
	$('#fileSize').val(null);
	$('#uploadForm')[0].reset();
}

$(document).on('click', '#addBtn', function(){
	if($('#addBtn i').hasClass('fa-plus')){
		showUploadBox();
		$('#projectName').prop('disabled', false);
	}
	else{
		hideUploadBox();
	}
});

function updateBuild(file){
	hideUploadBox();
	showUploadBox();
	$('#projectName').val(file.projectName);
	$('#_id').val(file._id);
	$('#fileCreatedBy').val(file.fileCreatedBy);
	$('#fileName').val(file.fileName);
	$('#fileSize').val(file.fileSize);
	$('#projectName').prop('disabled', true);
}
