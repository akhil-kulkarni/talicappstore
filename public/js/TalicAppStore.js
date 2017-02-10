function loginFormSubmit() {
	"use strict";
	var username = $('#username').val();
	var password = $('#password').val();
	if(!!username && !!password){
		$.ajax({
			url: '/login',
			type: "POST",
			data: {"username": username, "password": ____trI343fjjdl(username, password)},
			success: function(res){
				if(!!res){
					if(!!res.error){
						alert(res.msg);
					}
					else{
						window.location = res.render;
					}
				}
				else{
					alert("Could not login!");
				}
			}
		});
	}
	else{
		alert("Please enter the username and password.");
	}
}

function downloadFile(type, currEle){
	if(type=='apk'){
		$(currEle).closest('form').submit();
	}
	else if(type=="ipa"){
		var form = $(currEle).closest('form');
		var sendObj = { "filePath": form.find("input[name='filePath']").val(), "_id": form.find("input[name='_id']").val(), "isipa": true };
		$.ajax({
			url: "/download",
			type: "GET",
			data: sendObj,
			success: function(res){
				if(!!res){
					if(!res.success){
						console.log("download ipa error: " + res.err);
					}
				}
			}
		});
	}
}
