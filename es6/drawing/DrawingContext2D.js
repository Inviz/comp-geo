import AffineTransform from '../helpers/AffineTransform';
import Curve from '../primitives/Curve';
import LineSegment from '../primitives/LineSegment';
import Circle from '../primitives/Circle';
import Rectangle from '../primitives/Rectangle';
import Path from '../shapes/Path';
import {angleFrom} from '../helpers/Angles';

export default createDrawingContext;

function createDrawingContext(ctx, aabb, area, dimension) {
	var metrics = {
		"aabb": aabb,
		"area": area,
		"dimension": dimension,
		"map": [area.left - dimension * aabb.left,
				area.top - dimension * aabb.top]};

	return new DrawingContext2D(ctx, metrics);
}

function DrawingContext2D(ctx, metrics) {
	this.ctx = ctx;
	this.canvas = ctx.canvas;
	this.transformation = AffineTransform.create();
	this.metrics = metrics;
	this.legend = [];
}

Object.assign(DrawingContext2D.prototype, {
	// Primitive pathing
	begin, moveTo, lineTo, arc,

	// Geometric pathing
	line, curve, circle, dot, rectangle, path, arrowhead, object,

	// Transformation
	map,

	// Drawing
	text,
	"clip": 	function() { return this.ctx.clip(); },
	"fill": 	function() { return this.ctx.fill(); },
	"stroke": 	function() { return this.ctx.stroke(); },
});

var Tau = 2 * Math.PI;

function begin(transformation) {
	this.transformation = transformation || AffineTransform.create();
	this.ctx.beginPath();
}

function moveTo(position) {
	position = this.map(position);
	this.ctx.moveTo(position[0], position[1]);
}

function lineTo(position) {
	position = this.map(position);
	this.ctx.lineTo(position[0], position[1]);
}

function arc(center, radius, startAngle, endAngle, isCounterClockwise) {
	center = this.map(center);
	var decomposed = AffineTransform.decompose(this.transformation),
		scale = Math.max(decomposed.scale[0], decomposed.scale[1]);
	scale *= this.metrics.dimension;
	this.ctx.arc(center[0], center[1], radius * scale, startAngle, endAngle, isCounterClockwise);
}

function line(segment) {
	this.moveTo(segment.start);
	this.lineTo(segment.end);
}

function curve(curve) {
	let startAngle = angleFrom(curve.start, curve.center),
		endAngle = angleFrom(curve.end, curve.center);
	this.arc(curve.center, curve.radius, startAngle * Tau, endAngle * Tau, curve.orientation > 0);
}

function circle(circle) {
	this.arc(circle.center, circle.radius, 0, Tau, false);
}

function dot(position, radius) {
	position = this.map(position);
	this.ctx.arc(position[0], position[1], radius, 0, Tau, false);
}

function rectangle(rectangle) {
	this.ctx.rect(
		this.map(rectangle.left),
		this.map(rectangle.top),
		this.map(rectangle.width),
		this.map(rectangle.height));
}

function path(path) {
	var start = this.moveTo(path.segments[0].start);
	this.moveTo(path.segments[0].start);
	for (let segment of path.segments) {
		if (segment instanceof LineSegment)
			this.lineTo(segment.end);
		else if (segment instanceof Curve)
			this.curve(segment);
		else
			throw "Only line segments and curves supported by paths at the moment";
	}
}

function arrowhead(position, direction) {
	var length = Math.min(this.ctx.canvas.width, this.ctx.canvas.height) * 0.25,
		wingLength = length * 0.0625 / 2;

	position = this.map(position);
	var v = vec2.clone(direction);
	vec2.normalize(v, v);

	var wing1 = vec2.fromValues(-v[0] - v[1], -v[1] + v[0]);
	vec2.scale(wing1, wing1, wingLength);
	vec2.add(wing1, position, wing1);

	var wing2 = vec2.fromValues(-v[0] + v[1], -v[1] - v[0]);
	vec2.scale(wing2, wing2, wingLength);
	vec2.add(wing2, position, wing2);

	this.ctx.moveTo(wing1[0], wing1[1]);
	this.ctx.lineTo(position[0], position[1]);
	this.ctx.lineTo(wing2[0], wing2[1]);
}

function object(object) {
	if (object instanceof Path)
		this.path(object);
	else if (object instanceof Circle)
		this.circle(object);
	else if (object instanceof Rectangle)
		this.rectangle(object);
	else if (object instanceof LineSegment)
		this.line(object);
	else if (object instanceof Curve)
		this.curve(object);
	else
		throw "Cannot apply a non-closed geometric as a context path";
}

function map(position) {
	var metrics = this.metrics;
	position = AffineTransform.map(this.transformation, position);
	return [position[0] * metrics.dimension + metrics.map[0],
			position[1] * metrics.dimension + metrics.map[1]];
}

function isClosed(object) {
	return (object instanceof Path)
		|| (object instanceof Circle)
		|| (object instanceof Rectangle);
}

function text(string, position) {
	position = this.map(position);
	var composition = AffineTransform.decompose(this.transformation);
	var matrix = AffineTransform.rotate(AffineTransform.create(), composition.rotate);
	this.ctx.translate(position[0], position[1]);
	this.ctx.transform.apply(this.ctx, matrix);
	this.ctx.fillText(string, 0, 0);
}
