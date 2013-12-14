(function($) {
	'use strict';

	var isDebug = false;
	var type = window.location.pathname.split('/',2)[1];
	var $body = $('body');

	function addRating(results) {
		var $list = $('<dl class="properties imdb-ratings-snap">');

		$.each(results, function(index, result) {
			var $dt = $('<dt>');
			$dt.text(result.label + ':');

			var $dd = $('<dd>');

			if (result.rating !== null) {
				var $stars = $('<span class="imdb-ratings-snap-stars">')
				.attr('title', result.rating + ((result.maxRating === 100) ?  '%' : ' / ' + result.maxRating))
				.appendTo($dd);

				var roundedPercentage = Math.round(result.rating / result.maxRating * 10) / 10;
				for (var i = 0; i < 5; i++) {
					var cls = 'fa-star-o';
					var fullStarPercentage = (i + 1) / 5;
					// weird rounding is needed because of JS float (try 0.8 - 0.1 :D)
					var halfStarPercentage = Math.round((fullStarPercentage - 1 / 10) * 10) / 10;
					if (fullStarPercentage <= roundedPercentage) {
						cls = 'fa-star';
					} else if(halfStarPercentage <= roundedPercentage) {
						cls = 'fa-star-half';
					}
					$stars.append('<i class="fa ' + cls + ' imdb-ratings-snap-star"></i>');
				}
			}
			if(result.details) {
				$('<i class="fa fa-comment imdb-ratings-snap-extra"></i>')
				.attr('title', result.details)
				.appendTo($dd);
			}

			if(result.url) {
				$('<a>', {
					target: '_blank',
					href: result.url
				})
				.append('<i class="fa fa-external-link imdb-ratings-snap-extra"></i>')
				.appendTo($dd);
			}
			if (!$dd.is(':empty')) {
				$dd.append('&nbsp;');
				$list.append($dt).append($dd);
			}
		});

		if (!$list.is(':empty')) {
			$('.detailPageMod > h2').after($list);
		}
	}

	// shamelessly taken from http://stackoverflow.com/questions/4292320
	function htmlNumericEntityUnescape(string) {
		return string.replace(/&#([^\s]*);/g, function(match, match2) {return String.fromCharCode(Number(match2));});
	}

	var annotate = function(data) {
		var result = [];
		if(data.imdbID) {
			result.push({
				type: 'imdb',
				label: 'IMDb',
				rating: data.imdbRating !== 'N/A' ? +data.imdbRating : null,
				maxRating: 10,
				url: 'http://www.imdb.com/title/' + encodeURIComponent(data.imdbID),
				details: null
			});
		}
		if(data.tomatoMeter !== 'N/A') {
			result.push({
				type: 'rotten',
				label: 'Rotten Tomatoes',
				rating: +data.tomatoMeter,
				maxRating: 100,
				url: null,
				details: data.tomatoConsensus !== 'N/A' ? htmlNumericEntityUnescape(data.tomatoConsensus) : null
			});
		}

		addRating(result);
	};

	var queries = {
		film: [],
		serie: []
	};

	function getReleaseInfo() {
		return {
			year: +$('.DetailPage_labelproduction_year + dd').text()
		};
	}

	function getMovieDescription() {
		return $('.detailPageMod > h2').text();
	}

	function getMovieOriginalTitle() {
		return $('.DetailPage_labeloriginal_title + dd').text();
	}

	var original = getMovieOriginalTitle();
	queries.film.push(function() {
		return {
			t:			original,
			y:			getReleaseInfo().year,
			tomatoes:	true
		};		
	});

	// Remove labeling, e.g. 'Sucker Punch <3D>' -> 'Sucker Punch'
	var cleaned = original.replace(/\s+<.*?>$/g, '');
	if(cleaned !== original) {
		queries.film.push(function() {
			return {
				t:			cleaned,
				y:			getReleaseInfo().year,
				tomatoes:	true
			};		
		});
	}

	queries.film.push(function() {
		return {
			t:			getMovieDescription(),
			y:			getReleaseInfo().year,
			tomatoes:	true
		};			
	});

	queries.serie.push(function() {
		return {
			t:			getMovieDescription(),
			tomatoes:	true
		};
	});

	function fallbackQuery() {
		var curFn = queries[type].shift();
		if(typeof curFn === 'function') {
			var query = curFn();
			if(isDebug) {
				window.console.log('query', query);
			}
			$body.trigger('snap.ratings.load', [query]);
		} else {
			window.console.error('Could not find any data');
		}
	}	

	$body.on('snap.ratings.return', function(e, data) {
		if(data.Response === 'True') {
			if(isDebug) {
				window.console.debug('success', data);
			}
			annotate(data);
		} else {
			if(isDebug && data.Error) {
				window.console.debug('error', data.Error);
			}
			fallbackQuery(queries[type]);
		}
	});

	fallbackQuery();

})(window.jQuery);