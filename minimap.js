(function ($) {

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
	lineWidth: 1,
	fontSize: 4
};

$.minimap.prototype = {
	init: function (container, textArea, options) {
		this.settings = $.extend({}, $.minimap.defaults, options);

		this.container = container;
		this.text = textArea;

		// detect what actual font pixels are in textArea
		this.lineHeight = $.detectFontSize(
				parseInt(this.text.css('font-size'), 10));

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
		this.text.live('keyup', {pre: this.changeHandler}, this.redrawProxy)
				.bind('scroll', this.redrawProxy);
	},

	unbindHandlers: function () {
		this.text.die(this.redrawProxy);
		this.text.unbind(this.redrawProxy);
		this.container.unbind(this.redrawProxy);
	},

	lineToCtxPx: function (line) {
		return line * this.settings.fontSize;
	},

	clear: function(regional, top, bottom) {
		var ctx = this.ctx,
			y = 0,
			h = this.height;

		ctx.save();

		if (regional) {
			// only clear from top line to bottom line
			y = this.lineToCtxPx(top) - this.settings.lineWidth;
			h = this.lineToCtxPx(bottom) - y + this.settings.lineWidth;
		}

		ctx.clearRect(0, y, this.width, h);
		ctx.fillStyle = "rgb(100, 100, 100)";
		ctx.fillRect(0, y, this.width, h);

		ctx.restore();
	},

	drawText: function drawText(useCache, top, bottom) {
		this.ctx.save();

		// get the text from the textarea
		var text = this.text.val();
		if (!text) { return; }

		// break text in to lines
		if (!useCache) {
			this.lines = text.split("\n");
		}

		this.ctx.fillStyle = "rgb(255, 255, 255)";

		var ii = useCache && top ? Math.max(top - 1, 0) : 0,
			fontSize = this.settings.fontSize,
			off = ii * fontSize + fontSize;
			len = useCache && typeof(bottom) === "number" ? bottom : this.lines.length,
			line = "";

		for (ii; ii < len; ii++) {
			line = this.lines[ii];
			this.ctx.fillText(line, 0, off, this.width);
			off += fontSize;

			if (off > this.height) {
				break;			// no need to draw stuff out of boundary
			}
		}

		this.ctx.restore();
	},

	curLine: function curLines() {
		return Math.round(this.text.scrollTop() / this.lineHeight);
	},

	numLinesShown: function numLinesShown() {
		return this.text.innerHeight() / this.lineHeight;
	},

	drawBox: function drawBox(top, bottom) {
		this.ctx.save();

		this.ctx.strokeStyle = "rgb(200,200,200)";
		this.ctx.lineWidth = this.settings.lineWidth;
		this.ctx.fillStyle = "white";
		this.ctx.strokeRect(0, top, this.width, bottom);

		this.ctx.restore();
	},

	changeHandler: function (eve) {
		// if it's an arrow key, then we can ignore.
		var key = eve.which;
		if (key <= 40 && key >= 37) {
			return false;	// this event will be handled by scroll
		}

		return true;
	},

	redraw: function (eve) {
		var linesShown = this.numLinesShown(),
			topLine = this.curLine(),
			bottomLine = linesShown + topLine,
			topPx = this.lineToCtxPx(topLine),
			pxHeight = this.lineToCtxPx(linesShown),
			isScroll = eve.type === "scroll",
			data = eve.data || {},
			affectedTop, affectedBottom;
		
		if (data.pre) {
			if (data.pre(eve)) { return; }
		}

		if (this.settings.debug) {
			console.time("redrawing");
		}

		if (isScroll) {
			affectedTop = Math.min(topLine, this.oldTopLine);
			affectedBottom = Math.max(bottomLine, this.oldBottomLine);
		}

		// need to clear and redraw old space to new space region
		this.clear(isScroll, affectedTop, affectedBottom);
		this.drawText(isScroll, affectedTop, affectedBottom);

		// draw box only around the new space
		this.drawBox(topPx, pxHeight);

		// remember current space as new space
		this.oldTopLine = topLine;
		this.oldBottomLine = bottomLine;

		if (this.settings.debug) {
			console.timeEnd("redrawing");
		}
	}
};

$.fn.minimap = function (options) {

	$(this).each(function () {
		var inst = new $.minimap($(this), $('#text'),  options);
		$(this).data('minimap', inst);
	});
};

}(jQuery));
