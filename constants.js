var constants = {
	projectRoot: __dirname,
	uploadsFolderPath: __dirname + "/public/uploads",
	allowedFileTypes: "_apk_ipa_",
	oAuth2Config: {
		//type: 'OAuth2',
		user: "akhil16.4.93@gmail.com",
		clientId: "583141723618-qi3n1ho0sn4ogr8aftp41b3rdlmloekk.apps.googleusercontent.com",
		clientSecret: "-cyk3zLxh-ktVyBcCEQNK53-",
		refreshToken: "1/eOv5AmzVI8uyv479fwWKv7AYv0yOGBwf-1TZz6wkMhY"
	},
	plistTemplate: '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>items</key><array><dict><key>assets</key><array><dict><key>kind</key><string>software-package</string><key>url</key><string>||URL||</string></dict></array><key>metadata</key><dict><key>bundle-identifier</key><string>||BUNDLE_IDENTIFIER||</string><key>kind</key><string>software</string><key>title</key><string>||TITLE||</string><key>version</key><string>||VERSION_NO||</string></dict></dict></array></dict></plist>'
};

module.exports = constants;
