/**
 * @description Draw a minimap of text
 * @author Ziling Zhao <zilingzhao@gmail.com>
 * @requires $.detectFontSize
 *
 */
(function ($) {

$.minimap = function () { this.init.apply(this, arguments); };
$.minimap.defaults = {
	lineWidth: 1,			// width in px for the box
	fontSize: 4				// font size of text in canvas
};

$.minimap.CanvasView = function () { this.init.apply(this, arguments); };

$.minimap.CanvasView.prototype = {

init: function (container, options) {
	this.settings = $.extend({
			fontSize: 4		// size of font to render in canvas
		}, options);
	this.container = container;

	this.lines = [];		// the lines of text to draw

	this.topLine = 0;		// what line num is at the top (viewable)
	this.bottomLine = 0;	// what line is at the bottom (viewable)

	// construct the canvas and get the context
	this.canvas = this._createCanvas(container);
	this.ctx = this.canvas.get(0).getContext("2d");
	this.ctx.font = this.settings.fontSize + "px monospace";

	// canvas height and width in px, aka view window size
	this.vwHeight = this.canvas.attr('height');
	this.vwWidth = this.canvas.attr('width');

	// total lines that the canvas can show
	this.maxLines = this.vwHeight / this.settings.fontSize;

	this.boxView = {
		topLine:	0,
		heightLine:	0,
		topPx:		0,
		heightPx:	0
	};

},

unbindHandlers: function () {
	this.canvas.unbind('.minimap');
	$('body').unbind('.minimap');
},

line2px: function (line) {
	return line * this.settings.fontSize;
},

px2line: function (px) {
	return px / this .settings.fontSize;
},

px2surroundLine: function (px) {
	return this.topLine + this.px2line(px - ( this.boxView.heightPx / 2 ));
},

getContext: function () {
	return this.ctx;
},

updateView: function (topLine, bottomLine) {
	// TODO can this be written cleaner?
	if (topLine < 0) {
		this.topLine = 0;
		this.bottomline = Math.min(this.lines.length, this.topLine + this.maxLines);
	} else if (bottomLine > this.lines.length) {
		this.bottomLine = this.lines.length;
		this.topLine = Math.max(0, this.bottomLine - this.maxLines);
	} else if (topLine < this.topLine) {
		this.topLine = Math.max(topLine, 0);
		this.bottomline = Math.min(this.lines.length, this.topLine + this.maxLines);
	} else if (bottomLine > this.bottomLine) {
		this.bottomLine = Math.min(bottomLine, this.lines.length);
		this.topLine = Math.max(0, this.bottomLine - this.maxLines);
	}
},

updateViewBox: function (topLine, height) {
	if (!height) {
		height = this.boxView.heightLine;
	} else {
		this.boxView.heightLine = height;
	}

	var bottomLine = topLine + height;

	this.boxView.topLine = topLine;
	this.boxView.topPx = this.line2px(topLine);
	this.boxView.heightPx = this.line2px(height);

	if (topLine < 0) {
		this.boxView.topLine = 0;
	}

	this.updateView(topLine, bottomLine);
},

_createCanvas: function (cvdiv) {
	var width = 200,
		bodyHeight = $('body').innerHeight(),
		height = bodyHeight - cvdiv.position().top;

	return $(['<canvas id="view" width="', width,
			'px" height="', height, 'px"></canvas>'].join(""))
		.appendTo(cvdiv);
},

/**
 * @description update the lines of text
 * @param text
 */
updateText: function (text) {
	this.lines = text.replace(/\t/g, "    ").split("\n");

	// need to update bottomLine
	var possibleBtm = this.lines.length - this.topLine,
		maxBtm = this.topLine + this.maxLines;
	this.bottomLine = Math.min(possibleBtm, maxBtm);
},

/**
 * Clear canvas
 * @description clear whole or region of the canvas
 * @param top the line to start clearing from
 * @param bottom the line to stop clearing at
 */
clear: function (top, bottom) {
	var ctx = this.ctx,
		y = top || 0,
		h = bottom ? bottom - top : this.vwHeight;

	ctx.save();

	ctx.fillStyle = "rgb(100, 100, 100)";
	ctx.fillRect(0, y, this.vwWidth, h);

	ctx.restore();
},

drawBox: function () {
	 this.ctx.save();

	 this.ctx.translate(0, this.line2px(this.boxView.topLine - this.topLine));

	 this.ctx.strokeStyle = "rgb(200,200,200)";
	 this.ctx.lineWidth = this.settings.lineWidth;
	 this.ctx.fillStyle = "white";
	 this.ctx.strokeRect(0, 0, this.vwWidth, this.boxView.heightPx);

	 this.ctx.restore();
},

/**
 * @description repaint the entire view window
 */
redraw: function () {
	this.clear();

	this.ctx.save();
	this.ctx.fillStyle = "rgb(255, 255, 255)";

	var curLine = Math.floor(this.topLine),
		fontSize = this.settings.fontSize,
		off = (1 - (this.topLine - curLine)) * fontSize,
		btm = this.bottomLine,
		line = "";

	for (curLine; curLine < btm; curLine++) {
		line = this.lines[curLine];
		this.ctx.fillText(line, 0, off, this.vwWidth);

		if (off > this.vwHeight + fontSize) {
			break;			// no need to draw stuff out of view window
		}

		off += fontSize;
	}

	this.drawBox();

	this.ctx.restore();
},

scrollTop: function (nTopLine, redraw) {
	this.updateView(nTopLine);
	if (redraw) { this.redraw(); }
},

/**
 * scroll view window x lines
 * @description scrolldown some num of lines, negative is up, this scroll
 *   scrolls entire view window
 * @param nLines, some number of lines scrolled
 */
scrollLines: function (nLines, redraw) {
	this.scrollTop(this.topLine + nLine, redraw);
},

scrollBottom: function (nBottomLine, redraw) {
	this.scrollTop(nBottomLine - this.maxLines, redraw);
}
};

$.minimap.prototype = {
	init: function (container, textArea, options) {
		this.settings = $.extend({}, $.minimap.defaults, options);

		this.container = container;

		// this is the actual canvas
		this.mmWindow = new $.minimap.CanvasView(this.container, this.settings);
		this.text = textArea
			.attr('wrap', 'off')
			.css('overflow-x', 'scroll');

		// detect what actual font pixels are in textArea
		this.fontHeight = $.detectFontSize(
				parseInt(this.text.css('font-size'), 10));

		this.oldTopLine = 0;
		this.oldBottomLine = 0;
		this.bindHandlers();

		this.dragging = false;
	},

	bindHandlers: function () {
		var redrawProxy = $.proxy(this.redraw, this);
		this.container.bind('redraw.minimap', redrawProxy);
		this.text.live('keyup.minimap', {pre: this.changeHandler}, redrawProxy)
				.bind('scroll.minimap', redrawProxy);

		var mousehandler = $.proxy(this.mouseHandler, this);

		this.mmWindow.canvas
			.bind('mousedown.minimap', mousehandler)
			.bind('mousemove.minimap', mousehandler);

		$('body')
			.bind('mouseup.minimap mouseenter.minimap', {stopDrag: true}, mousehandler);
	},

	unbindHandlers: function () {
		this.text.die('.minimap')
			.unbind('.minimap');
		this.container.unbind('.minimap');

		this.mmWindow.canvas.unbind('.minimap');
		$('body').unbind('.minimap');
	},

	recenter: function (y) {
		var line = this.mmWindow.px2surroundLine(y - this.mmWindow.canvas.get(0).offsetTop);
		this.mmWindow.updateViewBox(line, true);

		this.text.scrollTop(this.line2CPx(this.mmWindow.boxView.topLine));

		this.redraw();
	},

	mouseHandler: function (eve) {
		var type = eve.type;

		clearInterval(this.recenterInterval);
		if (eve.data && eve.data.stopDrag) {
			this.dragging = false;
			return;
		}

		var rerecenter = $.proxy(function () {
				this.recenter(eve.pageY);
			}, this);

		if (type === 'mousemove' && this.dragging) {
			this.recenter(eve.pageY);
			this.recenterInterval = setInterval(rerecenter, 0);
		} else if (type === "mouseup") {
			this.dragging = false;
		} else if (type === "mousedown") {
			this.dragging = true;
			this.recenterInterval = setInterval(rerecenter, 0);
		}
	},

	line2CPx: function (line) {
		return line * this.fontHeight;
	},

	reloadText: function () {
		this.mmWindow.updateText(this.text.val());
	},

	curLine: function curLines() {
		return this.text.scrollTop() / this.fontHeight;
	},

	/**
	 * Determine the number of lines being shown in the textarea, this may
	 * not return an integer.
	 */
	linesInTextArea: function linesInTextArea() {
		return this.text.get(0).clientHeight / this.fontHeight;
	},

	changeHandler: function (eve) {
		var key = eve.which;
		if (key <= 40 && key >= 33) {
			// arrow keys, pg up/down, home/end
			return false;	// this event will be handled by scroll
		}

		return true;
	},

	redraw: function (eve) {
		var txtLines = this.linesInTextArea(),
			topLine = this.curLine(),
			bottomLine = txtLines + topLine,

			isScroll = eve && eve.type === "scroll",
			data = eve && eve.data || {};

		/* if triggered while dragging, canvas draw already handled */
		if (eve && this.dragging) { return; }

		if (data.pre) {
			if (!data.pre(eve)) { return; }
		}

		this.mmWindow.updateViewBox(topLine, txtLines);
		if (!isScroll) {
			this.reloadText();
		}

		if (this.settings.timing) {
			console.time("redrawing");
		}

		this.mmWindow.redraw();

		this.oldTopLine = topLine;
		this.oldBottomLine = bottomLine;

		// remember current space as new space
		if (this.settings.timing) {
			console.timeEnd("redrawing");
		}
	}
};

$.fn.minimap = function (text, options) {

	$(this).each(function () {
		var inst = new $.minimap($(this), text,  options);
		$(this).data('minimap', inst);
	});

	return $(this);
};

}(jQuery));
