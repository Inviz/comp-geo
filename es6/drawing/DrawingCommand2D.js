import AffineTransform from '../helpers/AffineTransform';

var newClip = (state, object) => new DrawingCommand2D(state, object, measureBoundingBox, clip),
	newStroke = (state, object) => new DrawingCommand2D(state, object, measureBoundingBox, stroke),
	newFill = (state, object) => new DrawingCommand2D(state, object, measureBoundingBox, fill),
	newDot = (state, object) => new DrawingCommand2D(state, object, measurePoint, dot),
	newText = (state, string, position, font) => new DrawingCommand2D(state, {"string": string, "position": position, "font": font}, measureText, text),
	newArrow = (state, position, direction, length) => new DrawingCommand2D(state, {"position": position, "direction": direction, "length": length}, measureArrow, arrow),
	newArrowHead = (state, position, direction) => new DrawingCommand2D(state, {"position": position, "direction": direction}, measureArrow, arrowhead),
	newLegend = (state, description) => new DrawingCommand2D(state, {"description": description}, measureNothing, legend);

Object.defineProperties(exports, {
	"clip": 		{value: newClip},
	"stroke": 		{value: newStroke},
	"fill": 		{value: newFill},
	"text": 		{value: newText},
	"dot": 			{value: newDot},
	"arrow": 		{value: newArrow},
	"arrowhead": 	{value: newArrowHead},
	"legend": 		{value: newLegend}
});

function DrawingCommand2D(state, object, measureFunction, drawFunction) {
	state.commands.push(this);
	this.state = state.clone();
	this.object = object;
	this.measure = measureFunction;
	this.draw = drawFunction;

	var aabb = this.measure(Rectangle.minmax());
	if (measureFunction !== measureNothing)
		if (!isFinite(aabb.width) || !isFinite(aabb.height))
			throw "Invalid object";
}

Object.defineProperties(DrawingCommand2D.prototype, {
	"transformation": 	{get: function() {return this.state.transformation;}},
	"map": 				{value: map}
});

function map(rectangle) {
	return AffineTransform.mapRectangle(this.state.transformation, rectangle);
}

function measureBoundingBox(aabb) {
	return aabb.expand(this.map(this.object.boundingBox));
}
function measurePoint(aabb) {
	return aabb.expand(this.map(Rectangle.point(this.object)));
}
function measureArrow(aabb) {
	return aabb.expand(this.map(Rectangle.point(this.object.position)));
}
function measureText(aabb) {
	// We could and would like to measure the extent of the text at this point
	// but we'd have to scale it to the same size as the rest of the content,
	// which we cannot do until we know the scale of the rest of the content
	// at which point we're not really contributing to the size of the content
	// and so we just make sure the origin of the text is included, similar to
	// how arrows and arrowheads work
	return aabb.expand(this.map(Rectangle.point(this.object.position)));
}
function measureNothing(aabb) {
	return aabb;
}

function clip(context) {
	if (!context.isClosed(this.object))
		throw "Cannot clip an open object";

	context.object(this.object);
	context.clip();
}

function dot(context) {
	context.dot(this.object, window.devicePixelRatio * 2.5);
	context.fill();
}

function fill(context) {
	if (!context.isClosed(this.object))
		throw "Cannot clip an open object";

	context.object(this.object);
	context.fill();
}

function stroke(context) {
	context.object(this.object);
	context.stroke();
}

function text(context) {
	if (this.object.font) {
		var substyle = this.object.font;
		if (!substyle.name)
			substyle.name = this.state.fontname;
		if (!substyle.size)
			substyle.size = this.state.fontsize;
		context.ctx.font = substyle.size + "px " + substyle.name;
		if (substyle.baseline)
			context.ctx.textBaseline = substyle.baseline;
		if (substyle.align)
			context.ctx.textAlign = substyle.align;
	}
	context.text(this.object.string, this.object.position);
}

function arrow(context) {
	var start = context.map(this.object.position),
		length = Math.min(context.canvas.width, context.canvas.height) * 0.25 * (this.object.length || 1),
		segment = LineSegment.project(start, this.object.direction, length);
	context.ctx.moveTo(segment.start[0], segment.start[1]);
	context.ctx.lineTo(segment.end[0], segment.end[1]);
	pathArrowHead(context, segment.end, this.object.direction);
	context.stroke();
}

function arrowhead(context) {
	pathArrowHead(context, context.map(this.object.position), this.object.direction);
	context.stroke();
}

function pathArrowHead(context, position, direction) {
	var length = Math.min(context.ctx.canvas.width, context.ctx.canvas.height) * 0.25,
		wingLength = length * 0.0625 / 2;

	var v = vec2.clone(direction);
	vec2.normalize(v, v);

	var wing1 = vec2.fromValues(-v[0] - v[1], -v[1] + v[0]);
	vec2.scale(wing1, wing1, wingLength);
	vec2.add(wing1, position, wing1);

	var wing2 = vec2.fromValues(-v[0] + v[1], -v[1] - v[0]);
	vec2.scale(wing2, wing2, wingLength);
	vec2.add(wing2, position, wing2);

	context.ctx.moveTo(wing1[0], wing1[1]);
	context.ctx.lineTo(position[0], position[1]);
	context.ctx.lineTo(wing2[0], wing2[1]);
}

function legend(context) {
	context.legend.push({
		"style": this.state.style,
		"description": this.object.description
	});
}
