function ____trI343fjjdl(poiu, qwerty){
	if(!!qwerty){
		var salt = (poiu||"") + "|appstore";
		salt = CryptoJS.SHA256(salt) + '';
		qwerty = CryptoJS.SHA256(qwerty) + '';
		var hash = CryptoJS.PBKDF2(qwerty, salt, { hasher:CryptoJS.algo.SHA256, keySize: 512/32, iterations: 1000 }) + '';
		return hash;
	}
	return null;
}

function logout(){
	$.ajax({
		url: '/logout',
		type: "GET",
		success: function(res){
			if(!!res){
				if(!!res.error){
					alert(res.msg);
				}
				else{
					window.location.reload();
				}
			}
			else{
				alert("Could not login!");
			}
		}
	});
}

$(document).on("click", "#sideMenuWrapper", function(){
	$("#possibleSideMenu").toggle();
	if($("#possibleSideMenu").css("display")!=="none"){
		$(".sideMenuBurger").hide();
		$(".sideMenuCancel").show();
	}
	else{
		$(".sideMenuBurger").show();
		$(".sideMenuCancel").hide();
	}
});

$(document).mouseup(function (e) {
	var container = $("#loginWrapper");
	if ((!container.is(e.target)) && (container.has(e.target).length === 0) && (!$("#loginButton").is(e.target))) {
		container.hide();
		$("#loginButton").prop("value", "Login");
	}

	var possibleSideMenu = $("#possibleSideMenu");
	if ((!possibleSideMenu.is(e.target)) && (possibleSideMenu.has(e.target).length === 0) && (!$("#sideMenuWrapper").is(e.target)) && ($("#sideMenuWrapper").has(e.target).length === 0) && ($("#sideMenuWrapper").css("display")!=="none")) {
		possibleSideMenu.hide();
		$(".sideMenuBurger").show();
		$(".sideMenuCancel").hide();
	}
});
