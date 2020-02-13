(function ($) {
	var emojis=[];

	var emojRange = [
		[128513, 128591], [9986, 10000]
	  ];
	for (var i = 0; i < emojRange.length; i++) {
		var range = emojRange[i];
		for (var x = range[0]; x < range[1]; x++) {
			emojis.push('&#'+x+';')
		}
	}
	console.log(emojis);
	$.fn.emoji = function (params) {
		var defaults = {
			button: '&#x1F642;',
			place: 'before',
			emojis,
			fontSize: '20px',
			listCSS: {position: 'absolute', border: '1px solid gray', 'background-color': '#fff', display: 'none'},
			rowSize: 10,
		};
		var settings = {};
		if (!params) {
			settings = defaults;
		} else {
			for (var n in defaults) {
				settings[n] = params[n] ? params[n] : defaults[n];
			}
		}

		this.each(function (n, input) {
			var $input = $(input);

			function showEmoji() {
				$list.show();
				$input.focus();
				setTimeout(function () {
					$(document).on('click', closeEmoji);
				}, 1);
			}

			function closeEmoji() {
				$list.hide();
				$(document).off('click', closeEmoji);
			}

			function clickEmoji(ev) {
				if (input.selectionStart || input.selectionStart == '0') {
					var startPos = input.selectionStart;
					var endPos = input.selectionEnd;
					input.value = input.value.substring(0, startPos)
						+ ev.currentTarget.innerHTML
						+ input.value.substring(endPos, input.value.length);
				} else {
					input.value += ev.currentTarget.innerHTML;
				}

				closeEmoji();
				$input.focus();
				input.selectionStart = startPos + 2;
				input.selectionEnd = endPos + 2;
			}

			var $button = $('<span disabled id="emoji" class=" dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">').html(settings.button).css({cursor: 'pointer', 'font-size': settings.fontSize}).on('click', showEmoji);
			var $list = $('<div class="dropdown-menu">');
			for (var n in settings.emojis) {
				if (n > 0 && n % settings.rowSize == 0) {
					$("<br>").appendTo($list);
				}
				$("<span>").html(settings.emojis[n]).css({cursor: 'pointer', 'font-size': settings.fontSize}).on('click', clickEmoji).appendTo($list);
			}

			if (settings.place === 'before') {
				$button.insertBefore(this);
			} else {
				$button.insertAfter(this);
			}
			$list.insertAfter($input);
		});
		return this;
	};
}
)(jQuery);
