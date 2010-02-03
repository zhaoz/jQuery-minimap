(function ($) {

$('#canvasDiv').minimap({ debug: true, timing: false });

// load jquery into textarea
$.ajax({
	url: $('script[rel="jquery"]').attr('src'),
	success: function (data) {
		$('#text').val(data);
		$('#canvasDiv').trigger('redraw');
	}
});
}(jQuery));
