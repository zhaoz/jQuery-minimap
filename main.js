var canvas = $("#view");
var ctx = canvas.get(0).getContext("2d");

var area = $('#text');

var cs = { height: canvas.attr('height'), width: canvas.attr('width') };
var fontSize = 4;

ctx.font = fontSize + "px monospace";

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

refreshZoom();

area.live('keyup', function (eve) {
		refreshZoom();
	});
