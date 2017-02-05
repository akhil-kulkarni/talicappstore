function loginFormSubmit() {
	"use strict";
	var username = $('#username').val();
	var password = $('#password').val();
	if(!!username && !!password){
		$.ajax({
			url: '/login',
			type: "POST",
			data: {"username": username, "password": password},
			success: function(res){
				if(!!res){
					console.log("res: " + JSON.stringify(res));
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
