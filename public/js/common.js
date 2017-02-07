function ____trI343fjjdl(poiu, qwerty){
	if(!!qwerty){
		var salt = (poiu||"") + "|talicappstore";
		salt = CryptoJS.SHA256(salt) + '';
		qwerty = CryptoJS.SHA256(qwerty) + '';
		var hash = CryptoJS.PBKDF2(qwerty, salt, { hasher:CryptoJS.algo.SHA256, keySize: 512/32, iterations: 1000 }) + '';
		return hash;
	}
	return null;
}
