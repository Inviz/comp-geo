import AffineTransform from '../helpers/AffineTransform';
import DrawingCommand2D from './DrawingCommand2D';
import DrawingContext2D from './DrawingContext2D';
import Rectangle, {minmax as rectangleMinMax} from '../primitives/Rectangle';
import Random from 'kinda-random';

export default Drawing2D;

function Drawing2D(options, commands) {
	this.options = options || {"padding": 10 / 105, "legendArea": 200, "maximumLegendFontSize": 6, "legendFontName": "serif"};
	this.commands = commands || [];

	var elem = document.createElement("canvas");
	elem.width = 2 * 800;
	elem.height = 2 * 800;
	var defaults = elem.getContext("2d");
	this.style = defaults.strokeStyle;
	this.alpha = defaults.globalAlpha;
	this.operation = defaults.globalCompositeOperation;
	this.lineWidth = defaults.lineWidth * window.devicePixelRatio;
	this.lineCap = defaults.lineCap;
	this.lineJoin = defaults.lineJoin;
	this.miterLimit = defaults.miterLimit;
	this.transformation = AffineTransform.create();
	this.font = {"name": "serif", "size": 8 * window.devicePixelRatio};
	this.textAlign = defaults.textAlign;
	this.textBaseline = defaults.textBaseline;
}
Object.defineProperties(Drawing2D.prototype, {
	"clone": 	{value: clone},
	"draw": 	{value: drawDrawing2D},

	// Font setting
	"fontname": {
		get: function() {return this.font.name;},
		set: function(name) {this.font = {"name": name, "size": this.font.size};}},
	"fontsize": {
		get: function() {return this.font.size;},
		set: function(size) {this.font = {"name": this.font.name, "size": size};}},
	"fontstring": {get: function() {return this.fontsize + "px " + this.fontname;}},

	// Complex styling
	"createPattern": 		{value: createPattern},

	// Transforming
	"setTransform": {value: function(a, b, c, d, e, f) {this.transformation = [a, b, c, e, d, f];}},
	"transform": {value: function(a, b, c, d, e, f) {this.transformation = AffineTransform.multiply(this.transformation, [a, b, c, e, d, f]);}},
	"scale": 	{value: function(scale) {this.transformation = AffineTransform.scale(this.transformation, scale);}},
	"rotate": 	{value: function(angle) {this.transformation = AffineTransform.rotate(this.transformation, angle);}},
	"translate": {value: function(translation) {this.transformation = AffineTransform.translate(this.transformation, translation);}},

	// Drawing
	"clip": 	{value: function(object) {return DrawingCommand2D.clip(this, object);}},
	"fill": 	{value: function(object) {return DrawingCommand2D.fill(this, object);}},
	"stroke": 	{value: function(object) {return DrawingCommand2D.stroke(this, object);}},
	"dot": 		{value: function(object) {return DrawingCommand2D.dot(this, object);}},
	"arrow": 	{value: function(position, direction, length) {return DrawingCommand2D.arrow(this, position, direction, length);}},
	"arrowhead": {value: function(position, direction) {return DrawingCommand2D.arrowhead(this, position, direction);}},
	"text": 	{value: function(string, position, font) {return DrawingCommand2D.text(this, string, position, font);}},

	// Meta information
	legend: 	{value: function(description) {return DrawingCommand2D.legend(this, description);}}
});

var Properties = [
	{"property": "style", "apply": applyStyle},
	{"property": "alpha", "apply": (ctx, v) => ctx.globalAlpha = v},
	{"property": "operation", "apply": (ctx, v) => ctx.globalCompositeOperation = v},
	{"property": "lineWidth", "apply": (ctx, v) => ctx.lineWidth = v},
	{"property": "lineCap", "apply": (ctx, v) => ctx.lineCap = v},
	{"property": "lineJoin", "apply": (ctx, v) => ctx.lineJoin = v},
	{"property": "miterLimit", "apply": (ctx, v) => ctx.miterLimit = v},
	{"property": "font", "apply": (ctx, v) => ctx.font = v.size + "px " + v.name},
	{"property": "textAlign", "apply": (ctx, v) => ctx.textAlign = v},
	{"property": "textBaseline", "apply": (ctx, v) => ctx.textBaseline = v}
];

function clone() {
	var clone = new Drawing2D(this.options, this.commands);
	clone.transformation = this.transformation.slice();
	for (let mapping of Properties)
		clone[mapping.property] = this[mapping.property];
	return clone;
}

function applyStyle(ctx, style, context) {
	if (style.isLinearGradient) {
		style.apply(ctx, context);
	} else {
		ctx.strokeStyle = style;
		ctx.fillStyle = style;
	}
}

function createPattern() {
	var context = document.createElement("canvas").getContext("2d");
	return context.createPattern.apply(context, arguments);
}

function drawDrawing2D(canvas) {
	// Measure the contents of the drawing
	var aabb = rectangleMinMax();
	for (let command of this.commands)
		aabb = command.measure(aabb);

	var context = canvas.getContext("2d"),
		padding = this.options.padding,
		width = canvas.width - this.options.legendArea,
		height = canvas.height,
		area = new Rectangle(
			height * padding,
			width * (1 - padding),
			height * (1 - padding),
			width * padding),
		ratio = Math.max(aabb.width, aabb.height),
		dimension = Math.max(area.width / ratio, area.height / ratio);

	function decorate() {
		// Draw content area border
		context.save();
		context.strokeStyle = "#CCC";
		context.setLineDash([4, 16]);
		context.rect(area.left, area.top, area.width, area.height);
		context.stroke();
		context.restore();

		// Draw the dimension markers
		var MARK_LENGTH = 10,
			superior = Math.max(aabb.width, aabb.height),
			right = area.width * (aabb.width / superior),
			bottom = area.height * (aabb.height / superior);
		context.beginPath();
		context.moveTo(area.left - MARK_LENGTH, area.top);
		context.lineTo(area.left, area.top);
		context.lineTo(area.left, area.top - MARK_LENGTH);
		context.moveTo(area.left + right, area.top);
		context.lineTo(area.left + right, area.top - MARK_LENGTH);
		context.moveTo(area.left, area.top + bottom);
		context.lineTo(area.left - MARK_LENGTH, area.top + bottom);
		context.stroke();

		// Draw the dimension values
		var precision2 = value => Math.floor(value * 100) / 100;
		var GAP = 2;
		context.textBaseline = "baseline";
		context.textAlign = "center";
		context.fillText(precision2(aabb.left), area.left, area.top - MARK_LENGTH - GAP);
		context.fillText(precision2(aabb.right), area.left + right, area.top - MARK_LENGTH - GAP);
		context.textBaseline = "middle";
		context.textAlign = "right";
		context.fillText(precision2(aabb.top), area.left - MARK_LENGTH - GAP, area.top);
		context.fillText(precision2(aabb.bottom), area.left - MARK_LENGTH - GAP, area.top + bottom);
	}

	// Decorate the canvas with aabb information
	context.font = this.fontstring;
	decorate();

	// Apply the drawing to the canvas
	let drawingcontext = new DrawingContext2D(context, aabb, area, dimension);
	for (let command of this.commands) {
		context.save();

		// Apply state to the context
		let state = command.state;
		for (let mapping of Properties)
			mapping.apply(context, state[mapping.property], drawingcontext);

		// Draw the command
		drawingcontext.begin(state.transformation);
		command.draw(drawingcontext);

		context.restore();
	}

	// Add the legend
	var fontsize = Math.min(this.options.maximumLegendFontSize, Math.floor(area.height / Math.max(drawingcontext.legend.length, 1))),
		lineHeight = Math.floor(fontsize * 1.2);
	context.font = `${this.options.legendFontName} ${fontsize}px`;
	context.textAlign = "left";
	context.textBaseline = "bottom";
	let y = area.top + lineHeight;
	for (let item of drawingcontext.legend) {
		context.fillStyle = item["style"];
		context.fillText(item.description, area.right + fontsize, y);
		y += lineHeight;
	}

	return canvas;
}

if (global['window']) {
	var DEFAULT_LEGEND_AREA = 100 * window.devicePixelRatio;
	var DEFAULT_CANVAS_EXTENT = [500 * window.devicePixelRatio + DEFAULT_LEGEND_AREA, 500 * window.devicePixelRatio];
	var DRAW_BOUNDING_BOX = true;
	var styles = [
		"black", "blue", "red",
		"#003300", "#330000", "#0000FF",
		"#666600", "#006666", "#660066",
		"#330", "#033", "#303"];
}

Object.defineProperties(Drawing2D, {
	"log": 		{value: log},
	"warn": 	{value: warn},
	"error": 	{value: error},
	"canvas": 	{value: canvas},
	"draw": 	{value: drawComposite}
});

function DrawingComposite2D() {
	this.style = 0;
	this.inComposite = false;
}
Object.defineProperties(DrawingComposite2D.prototype, {
	"draw": 		{value: drawComposite},
	"canvas": 		{value: canvas},
	"log": 			{value: log},
	"apply": 		{value: apply},
	"setStyle": 	{value: setStyle}
});

function isComponent(object) {
	return isDrawable(object)
		|| isPoint(object)
		|| isFunction(object)
		|| isArray(object)
		|| isComposite(object);
}

function isDrawable(object) {
	return !!object
		&& isFunction(object.draw);
}

function isPoint(object) {
	return ((object instanceof Array) || (object instanceof Float32Array))
		&& object.length === 2
		&& (typeof object[0] === "number")
		&& (typeof object[1] === "number");
}

function isFunction(object) {
	return (object instanceof Function);
}

function isArray(object) {
	if (!(object instanceof Array))
		return false;

	for (let each of object)
		if (!isComponent(each))
			return false;

	return true;
}

function isComposite(object) {
	return !!object
		&& (object.visuals instanceof Array)
		&& isArray(object.visuals);
}

function drawComposite(object, canvas) {
	var composite = new DrawingComposite2D(),
		drawing = new Drawing2D();
	composite.apply(drawing, object);
	drawing.draw(canvas);
	return canvas;
}
function canvas(object, extent) {
	extent = extent || DEFAULT_CANVAS_EXTENT;
	var canvas = document.createElement("canvas");
	canvas.width = extent[0];
	canvas.height = extent[1];
	return this.draw(object, canvas);
}
function log(explanation, object, legend) {
	return console.canvaslog(this.canvas(object), explanation);
}
function warn(explanation, object) {
	return console.canvaswarn(this.canvas(object), explanation);
}
function error(explanation, object, next) {
	return console.canvaserror(this.canvas(object), explanation);
}

function apply(drawing, object) {
	if (isComposite(object)) {
		var clone = drawing;
		if (object.colour) {
			clone = drawing.clone();
			clone.style = object.colour;
		}
		if (object.alpha) {
			if (clone === drawing)
				clone = drawing.clone();
			clone.alpha = object.alpha;
		}
		if (object.legend) {
			if (clone === drawing)
				clone = drawing.clone();
			clone.legend(object.legend);
		}
		if (clone === drawing) {
			clone = drawing.clone();
			this.setStyle(clone);
		}
		let inComposite = this.inComposite;
		this.inComposite = true;
		this.apply(clone, object.visuals);
		this.inComposite = inComposite;
	} else {
		var clone = drawing.clone();
		this.setStyle(clone);
		if (isDrawable(object)) {
			if (DRAW_BOUNDING_BOX && !this.inComposite && object["boundingBox"]) {
				var faded = drawing.clone();
				faded.alpha = 0.1;
				faded.stroke(object.boundingBox);
			}
			object.draw(clone);
		} else if (isPoint(object)) {
			clone.dot(object);
		} else if (isFunction(object)) {
			object(clone);
		} else if (isArray(object)) {
			for (let each of object)
				this.apply(drawing, each);
		} else throw "Unknown component type";
	}
}

function setStyle(drawing) {
	if (this.inComposite) return;
	if (this.style < styles.length) {
		drawing.style = styles[this.style];
		this.style++;
	} else
		drawing.style = randomStyle();
}

function randomStyle() {
	var random = new Random();
	return "rgb(" +
		random.between(0, 255) + "," +
		random.between(0, 255) + "," +
		random.between(0, 255) + ")";
}
