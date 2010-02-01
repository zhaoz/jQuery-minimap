var MINFONTSIZE = false;

(function ($) {
/**
 * Detect minimal font size
 */
$.minFontSize = function (tSize) {
	var size = tSize || 1,
		actual,
		span = $("<span>&nbsp;</span>").css({
				'font-family': 'monospace',
				display: 'block',
				padding: '0px',
				margin: '0px',
				position: 'absolute',
				'z-index': '-100',
				left: '-999px'
			});
	$("body").append(span);

	span.css('font-size', size + 'px');
	actual = span.innerHeight();
	span.remove();
	return actual;
};

// load jquery into textarea
$.ajax({
	url: $('script[rel="jquery"]').attr('src'),
	success: function (data) {
		$('#text').val(data);
		refreshZoom();
	}
});

}(jQuery));

var canvas = $("#view"),
	ctx = canvas.get(0).getContext("2d"),
	area = $('#text');

var cs = { height: canvas.attr('height'), width: canvas.attr('width') };

var fontSize = 4;
if (MINFONTSIZE) {
	fontSize = 13;
}

ctx.font = fontSize + "px monospace";

function resizeCanvas(goalSize) {
	if (!goalSize) { goalSize = 4; }

	// determine actual height and width
	var height = canvas.height(),
		width = canvas.width();
	
	// resize to a ratio, fontSize == goalSize
	if (MINFONTSIZE) {
		var ratio = fontSize / goalSize;
		height = height * ratio;
		width = width * ratio;
		canvas.attr('height', height);
		canvas.attr('width', width);
	}

	cs = { height: canvas.attr('height'), width: canvas.attr('width') };
}

function clear() {
	ctx.save();

	ctx.clearRect(0, 0, cs.width, cs.height);
	ctx.fillStyle = "rgb(100, 100, 100)";
	ctx.fillRect(0, 0, cs.width, cs.height);

	ctx.restore();
}

function drawText() {
	ctx.save();

	// get the text from the textarea
	var text = area.val();
	if (!text) { return; }

	// break text in to lines
	var lines = text.split("\n");

	ctx.fillStyle = "rgb(255, 255, 255)";

	var ii,
		off = fontSize;
		len = lines.length,
		line = "";

	for (ii = 0; ii < len; ii++) {
		line = lines[ii];
		ctx.fillText(line, 0, off);
		off += fontSize;
	}

	ctx.restore();
}

function refreshZoom() {
	clear();
	drawText();
}

resizeCanvas();
refreshZoom();

area.live('keyup', function (eve) {
		refreshZoom();
	});
