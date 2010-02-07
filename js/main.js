(function ($) {
if (!window.console) {
	var types = ['debug', 'info', 'log', 'error'];
	var f = $.noop;
	window.console = {};
	$.each(types, function () { window.console[this] = f; });
}

$.detectFontSize = function (tSize, options) {
	var size = tSize || 1,
		actual,
		span = $("<span>&nbsp;</span>").css($.extend({
				'font-family': 'monospace',
				display: 'block',
				padding: '0px',
				margin: '0px',
				position: 'absolute',
				'z-index': '-100',
				'font-size': tSize + "px",
				left: '-999px'
			}, options));
	$("body").append(span);

	actual = span.innerHeight();
	span.remove();
	return actual;
};

if (!window.opera) {
	// opera doesn't have fillText
	$('#canvasDiv').minimap({ debug: true, timing: false });
}

// load jquery into textarea
$.ajax({
	url: $('script[rel="jquery"]').attr('src'),
	success: function (data) {
		$('#text').val(data);
		$('#canvasDiv').trigger('redraw');
	}
});
}(jQuery));
