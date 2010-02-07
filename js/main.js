var mm;
(function ($) {
if (!window.console) {
	var types = ['debug', 'info', 'log', 'error'];
	var f = $.noop;
	window.console = {};
	$.each(types, function () { window.console[this] = f; });
}

if (!window.opera) {
	// opera doesn't have fillText
	mm = $('#canvasDiv')
		.minimap({ debug: true, timing: true })
		.data('minimap');
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
