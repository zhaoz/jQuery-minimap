(function ($) {

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

function createCanvas(cvdiv) {
	var width = 200,
		bodyHeight = $('body').innerHeight(),
		height = bodyHeight - cvdiv.position().top;

	return $(['<canvas id="view" width="', width,
			'px" height="', height, 'px"></canvas>'].join(""))
		.appendTo(cvdiv);
}

$.minimap = function () { this.init.apply(this, arguments); };
$.minimap.defaults = {
	fontSize: 4
};

$.minimap.prototype = {
	init: function (container, textArea, options) {
		this.settings = $.extend({}, $.minimap.defaults, options);

		this.container = container;
		this.text = textArea;

		this.canvas = createCanvas(container);
		this.ctx = this.canvas.get(0).getContext("2d");
		this.ctx.font = this.settings.fontSize + "px monospace";

		this.height = this.canvas.attr('height');
		this.width = this.canvas.attr('width');

		this.bindHandlers();
	},

	bindHandlers: function () {
		this.redrawProxy = $.proxy(this.redraw, this);
		this.container.bind('redraw', this.redrawProxy);
		this.text.live('keyup', this.redrawProxy)
				.bind('scroll', this.redrawProxy);
	},

	unbindHandlers: function () {
		this.text.die(this.redrawProxy);
		this.text.unbind(this.redrawProxy);
		this.container.unbind(this.redrawProxy);
	},

	clear: function() {
		var ctx = this.ctx;

		ctx.save();

		ctx.clearRect(0, 0, this.width, this.height);
		ctx.fillStyle = "rgb(100, 100, 100)";
		ctx.fillRect(0, 0, this.width, this.height);

		ctx.restore();
	},

	drawText: function drawText() {
		var fontSize = this.settings.fontSize;
		this.ctx.save();

		// get the text from the textarea
		var text = this.text.val();
		if (!text) { return; }

		// break text in to lines
		var lines = text.split("\n");

		this.ctx.fillStyle = "rgb(255, 255, 255)";

		var ii,
			off = fontSize;
			len = lines.length,
			line = "";

		for (ii = 0; ii < len; ii++) {
			line = lines[ii];
			this.ctx.fillText(line, 0, off);
			off += fontSize;
		}

		this.ctx.restore();
	},

	drawBox: function drawBox() {
		// figure out where we are
		var top = this.text.scrollTop();
		console.log("offset from top: " + top);
	},

	redraw: function () {
		console.time("redrawing");
		this.clear();
		this.drawText();
		this.drawBox();
		console.timeEnd("redrawing");
	}
};

$.fn.minimap = function (options) {

	$(this).each(function () {
		var inst = new $.minimap($(this), $('#text'),  options);
		$(this).data('minimap', inst);
	});
};

}(jQuery));
