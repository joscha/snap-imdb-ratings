var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

var Request = require("sdk/request").Request;

var filme = /.*\.skysnap\.de\/film\/.*/;
var serien = /.*\.skysnap\.de\/serie\/.*/;

pageMod.PageMod({
	include: [filme, serien],
	contentScriptFile: [
						data.url("components/jquery.min.js"),
						data.url("firefox.js"),
						data.url("shared/inject.js")
					],
	contentStyleFile: [
						data.url("shared/inject.css")
					],
	contentScriptWhen: "ready",
	onAttach: function(worker) {
		worker.port.on('snap.ratings.load', function(query) {
			Request({
				url: 'http://www.omdbapi.com/',
				content: query,
				overrideMimeType: "application/json; charset=utf-8",
				onComplete: function (response) {
					worker.port.emit('snap.ratings.return', response.json);
				}
			}).get();
		});
	}
});