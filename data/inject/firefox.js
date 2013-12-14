(function($) {
	'use strict';
	
	var $body = $('body');

	$('head').append($('<link>', {
		href: '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css',
		rel: 'stylesheet'
	}));

	$body.on('snap.ratings.load',function(e, query) {
		self.port.emit("snap.ratings.load", query);
	});

	self.port.on('snap.ratings.return', function(data) {
		$body.trigger('snap.ratings.return', [data]);
	});
})(window.jQuery);