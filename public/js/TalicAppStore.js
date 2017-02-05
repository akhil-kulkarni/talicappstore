function loginFormSubmit() {
	"use strict";
	var username = $('#username').val();
	var password = $('#password').val();
	if(!!username && !!password){
		var salt = username + "|talicappstore";//CryptoJS.lib.WordArray.random(128 / 8) + '';
		salt = CryptoJS.SHA256(salt) + '';
		password = CryptoJS.SHA256(password) + '';
		var hash = CryptoJS.PBKDF2(password, salt, { hasher:CryptoJS.algo.SHA256, keySize: 512/32, iterations: 1000 }) + '';
		$.ajax({
			url: '/login',
			type: "POST",
			data: {"username": username, "password": hash},
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
