import vec2 from '../nd-linalg/Vector2';
import Path from '../shapes/Path';
import LineSegment from '../primitives/LineSegment';
import Curve from '../primitives/Curve';

export default function Pather(start) {
	this.current = start || vec2.fromValues(0, 0);
	this.direction = null;
	this.segments = [];
	this.orientation = 0;
}

Object.defineProperties(Pather.prototype, {
	"name":					{value: "Pather"},
	"path": 				{get: toPath},
	"isClockwise": 			{get: isClockwise},
	"isCounterClockwise": 	{get: isCounterClockwise},

	"append": 				{value: append},
	"moveTo": 				{value: moveTo},
	"lineTo": 				{value: lineTo},
	"curveTo": 				{value: curveTo},
	"close": 				{value: close},

	"scale": 				{value: scale},
	"translate": 			{value: translate}
});

function toPath() {
	return new Path(this.segments, this.isClockwise);
}

function isClockwise() {
	return this.orientation > 0;
}

function isCounterClockwise() {
	return !this.isClockwise;
}

function append(pather) {
	if (!pather.segments.length) return;
	this.segments = this.segments.concat(pather.segments);
	this.current = this.segments[this.segments.length - 1].end;
	this.direction = pather.direction;
	this.orientation += pather.orientation
	return this;
}

function moveTo(position) {
	this.current = position;
	this.direction = null;
	return this;
}

function lineTo(position) {
	var line = new LineSegment(this.current, position);
	this.segments.push(line);
	this.current = line.end;
	this.direction = line.direction;
	updateOrientation(this);
	return this;
}

function curveTo(position, direction) {
	function NoDirection() { throw "Direction required if no existing segments"; }
	var curve = new Curve(this.current, direction || this.direction || NoDirection(), position);
	this.segments.push(curve);
	this.current = curve.end;
	this.direction = curve.endDirection;
	updateOrientation(this);
	return this;
}

function close() {
	if (!this.segments.length)
		throw "Cannot close an empty path";
	if (this.path.isClosed)
		return this.path;

	var line = new LineSegment(this.current, this.segments[0].start);
	this.segments.push(line);
	this.current = line.end;
	this.direction = line.direction;
	updateOrientation(this);

	// console.log('after closing',this.path.isClosed );

	return this.path;
}

function scale(scale) {
	return this.path.scale(scale);
}

function translate(offset) {
	return this.path.translate(offset);
}

function updateOrientation(pather) {
	var segment = pather.segments[pather.segments.length - 1],
		dx = segment.end[0] - segment.start[0],
		dy = segment.end[1] + segment.start[1];
	pather.orientation += dx * dy;
}
