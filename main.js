// load jquery into textarea
$.ajax({
	url: $('script[rel="jquery"]').attr('src'),
	success: function (data) {
		$('#text').val(data);
		refreshZoom();
	}
});

var canvas = $("#view");
var ctx = canvas.get(0).getContext("2d");

var area = $('#text');

var cs = { height: canvas.attr('height'), width: canvas.attr('width') };
var fontSize = 13;

ctx.font = fontSize + "px monospace";

function resizeCanvas(goalSize) {
	if (!goalSize) { goalSize = 3; }

	// determine actual height and width
	var height = canvas.height();
		width = canvas.width();

	// resize to a ratio, fontSize == goalSize
	var ratio = fontSize / goalSize;
	
	canvas.attr('height', height * ratio);
	canvas.attr('width', width * ratio);

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
