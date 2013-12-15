(function($) {
	'use strict';
	
	var $body = $('body');
	$body.on('snap.ratings.load',function(e, query) {
		$.getJSON('http://www.omdbapi.com/', query, function(data) {
			$body.trigger('snap.ratings.return', [data]);
		});
	});
})(window.jQuery);