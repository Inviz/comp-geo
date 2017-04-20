import intersect from '../intersections/Intersections';
import {Vector2 as vec2} from '../nd-linalg';
import {corner as RectangleCorner} from './Rectangle';
import * as Triangle from './triangle';
import { roughlyEqual, roughlyBetween } from '../missing-stuff';
// import { colinear } from triangle;

export default LineSegment;

function LineSegment(start, end) {
	this.start = start;
	this.end = end;
	this.direction = vec2.sub(vec2(0, 0), this.end, this.start);
	this.length = vec2.len(this.direction);
	vec2.normalize(this.direction, this.direction);
}

function createProjection(start, direction, length) {
	var end = vec2.scale(vec2(0, 0), direction, length || 1);
	vec2.add(end, start, end);
	return new LineSegment(start, end);
}

LineSegment.project = createProjection;

Object.defineProperties(LineSegment.prototype, {
	"name": 						{value: "LineSegment"},
	"type": 						{value: intersect.LineSegmentTypeFunction},
	"isRay": 						{value: false},
	"isLineSegment": 				{value: true},
	"isCurve": 						{value: false},
	"isCircle": 					{value: false},

	"midpoint": 					{get: midpoint},
	"boundingBox": 					{get: boundingBox},
	"endDirection": 				{get: endDirection},

	"subdivide": 					{value: subdivide},
	"reverse": 						{value: reverse},
	"scale": 						{value: scale},
	"translate": 					{value: translate},
	"offsetPerpendicular": 			{value: offsetPerpendicular},

	"offsetPerpendicularLength":	{value: offsetPerpendicularLength},
	"mapPerpendicular": 			{value: mapPerpendicular},

	"containsPoint": 				{value: containsPoint},
	"roughlyContainsPoint": 		{value: roughlyContainsPoint},
	"getAlphaValueAtPosition":		{value: getAlphaValueAtPosition},
	"offsetOf": 					{value: offsetOf},
	"closestPointTo": 				{value: closestPointTo},
	"positionOf": 					{value: positionOf},
	"directionOf": 					{value: directionOf},

	"vertices": 					{value: vertices},
	"uvs": 							{value: uvs},
	"draw": 						{value: draw}
});

function midpoint() {
	var midpoint = vec2(0, 0);
	vec2.lerp(midpoint, this.start, this.end, 0.5);
	return midpoint;
}

var min = Math.min,
	max = Math.max;
function boundingBox() {
	var origin = vec2.clone(this.start);
	var corner = vec2.clone(this.start);
	origin[0] = min(origin[0], this.end[0]);
	origin[1] = min(origin[1], this.end[1]);
	corner[0] = max(corner[0], this.end[0]);
	corner[1] = max(corner[1], this.end[1]);
	return RectangleCorner(origin, corner);
}

function endDirection() {
	return this.direction;
}

function subdivide(p) {
	return [new LineSegment(this.start, p), new LineSegment(p, this.end)];
}

function reverse() {
	return new LineSegment(this.end, this.start);
}

function scale(scalar) {
	var start = vec2.clone(this.start),
		end = vec2.clone(this.end);
	vec2.scale(start, start, scalar);
	vec2.scale(end, end, scalar);
	return new LineSegment(start, end);
}

function translate(offset) {
	var start = vec2.clone(this.start),
		end = vec2.clone(this.end);
	vec2.add(start, start, offset);
	vec2.add(end, end, offset);
	return new LineSegment(start, end);
}

function containsPoint(point) {
	let perpendicularDirection = vec2.perpendicular(vec2(0, 0), direction);
	let startToPoint = vec2.sub(vec2(0, 0), start, p);
	let distance = Math.abs(vec2.dot(startToPoint, perpendicularDirection));
	let u = vec2.dot(startToPoint, this.direction);
	return distance < Intersections.THICKNESS && u > -THICKNESS && u < this.length + THICKNESS;

}

function roughlyContainsPoint(p) {
	// http://stackoverflow.com/questions/328107/how-can-you-determine-a-point-is-between-two-other-points-on-a-line-segment
	let start = this.start, end = this.end;
	return Triangle.colinear(start, p, end)
		&& ((roughlyEqual(start[0], p[0]) || roughlyEqual(end[0], p[0]))
			? roughlyBetween( start[1], p[1], end[1]) || roughlyBetween( end[1], p[1], start[1])
			: roughlyBetween( start[0], p[0], end[0]) || roughlyBetween( end[0], p[0], start[0]));
}


function getAlphaValueAtPosition(p) {
	return vec2.dist(this.start, p) / this.length;
}

function directionOf(p) {
	return this.direction;
}

function offsetOf(p) {
	return vec2.dot(this.direction, vec2.sub(vec2(0, 0), p, this.start));
}

function closestPointTo(p) {
	var offset = this.offsetOf(p);

	if (offset < 0)
		return this.start;
	if (offset > this.length)
		return this.end;

	return vec2.scaleAndAdd(vec2(0, 0), this.start, this.direction, offset);
}

function positionOf(offset) {
	return vec2.scaleAndAdd(vec2(0, 0), this.start, this.direction, offset);
}

function offsetPerpendicular(offsetToRight) {
	return new LineSegment(
		vec2.scalePerpendicularAndAdd(vec2(0, 0), this.start, this.direction, offsetToRight),
		vec2.scalePerpendicularAndAdd(vec2(0, 0), this.end, this.direction, offsetToRight)
	);
}

function offsetPerpendicularLength(offsetToRight) {
	return this.length;
}

function mapPerpendicular(offsetA, offsetToRightA, offsetToRightB) {
	return offsetA;
}

function vertices(offsetToRight) {
	offsetToRight = offsetToRight || 0;
	var start = offsetToRight
		? vec2.scalePerpendicularAndAdd(vec2(0, 0), this.start, this.direction, offsetToRight)
		: this.start;
	var end = offsetToRight
		? vec2.scalePerpendicularAndAdd(vec2(0, 0), this.end, this.direction, offsetToRight)
		: this.end;
	return [start, end];
}

function uvs(offsetToRight, multiplierAlongPath) {
	var startUV = vec2.fromValues(0, offsetToRight);
	var endUV = vec2.fromValues(this.length * multiplierAlongPath, offsetToRight);
	return [startUV, endUV];
}

function draw(context) {
	context.stroke(this);
}
