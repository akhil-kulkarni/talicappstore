var constants = {
	projectRoot: __dirname,
	uploadsFolderPath: __dirname + "/public/uploads",
	allowedFileTypes: "_apk_ipa_",
	fromEmailId: "talic.mobility@gmail.com",
	oAuth2Config_old: {
		//type: 'OAuth2',
		user: "akhil16.4.93@gmail.com",
		clientId: "583141723618-qi3n1ho0sn4ogr8aftp41b3rdlmloekk.apps.googleusercontent.com",
		clientSecret: "-cyk3zLxh-ktVyBcCEQNK53-",
		refreshToken: "1/eOv5AmzVI8uyv479fwWKv7AYv0yOGBwf-1TZz6wkMhY"
	},
	oAuth2Config: {
		//type: 'OAuth2',
		user: "talic.mobility@gmail.com",
		clientId: "971867477238-2fr7ubdq3r5f3testvqcajcpdr43ba9q.apps.googleusercontent.com",
		clientSecret: "Tw9fwzzwuPeezoREx455ax_t",
		refreshToken: "1/9jSgUbvAs3do7ODq0DiiKOXLph4i--2daIK7zh7zyT4"
	},

	plistTemplate: '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>items</key><array><dict><key>assets</key><array><dict><key>kind</key><string>software-package</string><key>url</key><string>||URL||</string></dict></array><key>metadata</key><dict><key>bundle-identifier</key><string>||BUNDLE_IDENTIFIER||</string><key>kind</key><string>software</string><key>title</key><string>||TITLE||</string><key>version</key><string>||VERSION_NO||</string></dict></dict></array></dict></plist>',

	uploadMailTemplate: "<div><div>Dear All,</div><div><p>A new build of the project <b>||projectName||</b> has been released and is now available for testing.</p><p><b>Project Description:</b> ||projectDesc||.</p></div><div><b>Change log:</b> ||changeLog||</div><div><b>File Link: </b><a href='||fileLink||'>||fileLink||</a></div><img src='||qrCode||'/></div><div><p>Kindly visit <a href='||siteURL||'>||siteURL||</a> to download the latest build.</p></div></div>",

	defaultPageName: "app store"
};

module.exports = constants;
