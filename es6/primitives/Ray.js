import Intersections from '../intersections/Intersections';
import {Vector2 as vec2} from 'nd-linalg';

export default Ray;

function Ray(start, direction) {
	this.start = start;
	this.direction = direction;
}

Object.defineProperties(Ray.prototype, {
	"name": 		{value: "Ray"},
	"type": 		{value: Intersections.RayTypeFunction},
	"isRay": 		{value: true},
	"isLineSegment": 		{value: false},
	"isCurve": 		{value: false},
	"isCircle": 	{value: false},

	"length": 		{value: Number.infinity},
	"end": 			{value: vec2.fromValues(Number.infinity, Number.infinity)},
	"midpoint": 	{value: Number.infinity},

	"subdivide": 	{value: subdivide},
	"reverse": 		{value: reverse},
	"scale": 		{value: scale},
	"translate": 	{value: translate},

	"draw": 		{value: draw},
	"boundingBox": 	{get: boundingBox}
});

function subdivide(p) {
	return [new LineSegment(this.start, p), new Ray(p, this.direction)];
}

function reverse() {
	return new Ray(this.start, vec2.negate(vec2(0, 0), this.direction));
}

function scale(scalar) {
	var start = vec2.clone(this.start);
	vec2.scale(start, start, scalar);
	return new Ray(start, this.direction);
}

function translate(offset) {
	var start = vec2.clone(this.start);
	vec2.add(start, start, offset);
	return new Ray(start, this.direction);
}

function boundingBox() {
	return Rectangle.point(this.start);
}

function draw(context) {
	context.arrow(this.start, this.direction);
}
