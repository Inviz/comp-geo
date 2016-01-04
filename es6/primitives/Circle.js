import intersect, {THICKNESS} from '../intersections/Intersections';
import {Vector2 as vec2} from 'nd-linalg';
import {angleFrom} from '../helpers/Angles';

export default Circle;

function Circle(center, radius) {
	this.center = center;
	this.radius = radius;
}

Object.defineProperties(Circle.prototype, {
	"name": 		{value: "Circle"},
	"type": 		{value: intersect.CircleTypeFunction},
	"isRay": 		{value: false},
	"isLineSegment": 		{value: false},
	"isCurve": 		{value: false},
	"isCircle": 	{value: true},

	"boundingBox": 	{get: boundingBox},

	"scale": 		{value: scale},
	"translate": 	{value: translate},

	"angle": 		{value: angle},
	"directionOf": 	{value: directionOf},
	"containsPoint": {value: containsPoint},

	"draw": 		{value: draw}
});

function boundingBox() {
	var origin = vec2.clone(this.center),
		corner = vec2.clone(this.center),
		radius = vec2.fromValues(this.radius, this.radius);
	vec2.sub(origin, origin, radius);
	vec2.add(corner, corner, radius);
	return Rectangle.corner(origin, corner);
}

function scale(scalar) {
	var center = vec2.clone(this.center),
		radius = radius * scalar;
	vec2.scale(center, center, scalar);
	return new Circle(center, radius);
}

function translate(offset) {
	var center = vec2.clone(this.center);
	vec2.add(center, center, offset);
	return new Circle(center, this.radius);
}
	
// Return the angle for point p on the circle
function angle(p) {
	return angleFrom(p, this.center);
}

function directionOf(p, asClockwise) {
	var vTail = vec2(0, 0);
	vec2.sub(vTail, this.center, p);
	var dTail = asClockwise
		? vec2.fromValues(-vTail[1], vTail[0])
		: vec2.fromValues(vTail[1], -vTail[0]);
	vec2.normalize(dTail, dTail);
	return dTail;
}

function containsPoint(p) {
	return vec2.dist(this.center, p) <= this.radius + THICKNESS;
}

function draw(context) {
	context.stroke(this);
}
