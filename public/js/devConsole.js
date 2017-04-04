$(function () {
	$('#selectFile').fileupload({
		dataType: 'json',
		replacefileinput: true,
		add: function (e, data) {
			$('#cancelUpload').off("click").on('click', function(){
					data.abort();
					alert("File upload cancelled!");
				}
			);
			$('#uploadBtn').off('click').on('click',
				function(){
					if(!$('#projectName').val()){
						alert("Please enter the project name.");
					}
					else if(!$('#projectDesc').val()){
						alert("Please enter the project description.");
					}
					else{
						data.formData = {
							"fileData": JSON.stringify(getFinalFileData())
						};
						console.log(data);
						data.submit();
					}
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
				if(!alert("File uploaded successfully!")){
					$('#_retFileId').val(data.result.msg._id);
					$('#retFileVersionNo').val(data.result.msg.fileVersionNumber);
					$('#sendMail').prop('disabled', false);
				}
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
		fileData.projectDesc = (($('#projectDesc').val()||"").trim()) || null;
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
	$('#_retFileId').val(null);
	$('#retFileVersionNo').val(null);
	$('#sendMail').prop('disabled', true);
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
	$('#_retFileId').val(null);
	$('#retFileVersionNo').val(null);
	$('#sendMail').prop('disabled', true);
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
	$('#_retFileId').val(null);
	$('#retFileVersionNo').val(null);
	$('#sendMail').prop('disabled', true);
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
		$('#projectDesc').prop('disabled', false);
	}
	else{
		hideUploadBox();
	}
});

function updateBuild(file){
	hideUploadBox();
	showUploadBox();
	$('#projectName').val(file.projectName);
	$('#projectDesc').val(file.projectDesc);
	$('#_id').val(file._id);
	$('#fileCreatedBy').val(file.fileCreatedBy);
	$('#fileName').val(file.fileName);
	$('#fileSize').val(file.fileSize);
	$('#projectName').prop('disabled', true);
	$('#projectDesc').prop('disabled', true);
}

$(document).on('change', '#isProduction', function(){
	if($('#isProduction').prop('checked')){
		$('#doNotDelete').prop('checked', true);
		$('#doNotDelete').prop('disabled', true);
	}
	else{
		$('#doNotDelete').prop('disabled', false);
	}
});

function isEmailIdInvalid(email){
	return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

function sendMail(from, toList, ccList, projectName, projectDesc, changeLog, isProduction, _id, fileVersionNumber){
	if(!!toList && toList.length>0){
		$.ajax({
			url: '/sendUploadMail',
			type: "POST",
			data: {"from": from || null, "toList": toList, "ccList": ccList, "projectName": projectName, "projectDesc": projectDesc, "changeLog": changeLog, "isProduction": isProduction, "_id": _id},
			success: function(res){
				if(!!res){
					if(!!res.error){
						alert(res.error);
					}
					else{
						if(!alert("mail sent successfully!")){
							window.location.reload();
						}
					}
				}
				else{
					alert("could not send the mail!");
				}
			}
		});
	}
	else{
		alert("'to' list cannot be empty!");
	}
}

$(document).on('click', '#sendMail', function(){
	$('#sendMail').prop("disabled", true);
	$('#sendMail').text("sending");
	var toList = null;
	var ccList = null;
	if(!!$('#mailTo').val())
		toList = $('#mailTo').val().split(";");
	if(!!$('#mailCC').val())
		ccList = $('#mailCC').val().split(";");
	var invalidEmailId = null;
	var i = 0;
	if(!!toList && (toList.length>0)){
		if(!!projectName && !!projectDesc){
			for(i=0; i<toList.length; i++){
				toList[i] = (!!toList[i])?(toList[i].trim()):toList[i];
				if(!isEmailIdInvalid(toList[i])){
					invalidEmailId = toList[i];
					break;
				}
			}
			if(!invalidEmailId && !!ccList && (ccList.length>0)){
				for(i=0; i<ccList.length; i++){
					ccList[i] = (!!ccList[i])?(ccList[i].trim()):ccList[i];
					if(!isEmailIdInvalid(ccList[i])){
						invalidEmailId = ccList[i];
						break;
					}
				}
			}
			if(!!invalidEmailId){
				alert(invalidEmailId + " is an invalid email id!");
			}
			else{
				sendMail($('#uploaderName').val(), toList, ccList, $('#projectName').val(), $('#projectDesc').val(), $('#changeLog').val(), $('#isProduction').prop('checked'), $('#_retFileId').val(), $('#retFileVersionNo').val());
			}
		}
		else if(!projectName){
			alert("project name cannot be empty!");
		}
		else if(!projectDesc){
			alert("project description cannot be empty!");
		}
	}
	else{
		alert("'to' list cannot be empty!");
	}
});

function deleteBuild(file){
	$.ajax({
		url: '/deleteBuild',
		type: "POST",
		data: {"file": file},
		success: function(res){
			if(!!res){
				if(!!res.error){
					alert(res.error);
				}
				else{
					if(!alert("build deleted successfully!")){
						window.location.reload();
					}
				}
			}
			else{
				alert("could not delete the build!");
			}
		}
	});
}
