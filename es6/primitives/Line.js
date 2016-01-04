import Intersections from '../intersections/Intersections';
import {Vector2 as vec2} from 'nd-linalg';

export default Line;

function Line(rayOrMiddle, direction) {
	if (rayOrMiddle.type === Intersections.RayTypeFunction) {
		this.middle = rayOrMiddle.start;
		this.direction = rayOrMiddle.direction;
		return this;
	}
	this.middle = rayOrMiddle; // LOL!
	this.direction = direction;
}

Object.defineProperties(Line.prototype, {
	"name": 		{value: "Line"},
	"type": 		{value: Intersections.LineTypeFunction},
	"isRay": 		{value: true},
	"isLineSegment":{value: false},
	"isCurve": 		{value: false},
	"isCircle": 	{value: false},

	"length": 		{value: Number.infinity},
	"start": 		{value: vec2.fromValues(Number.infinity, Number.infinity)},
	"end": 			{value: vec2.fromValues(Number.infinity, Number.infinity)},
	"midpoint": 	{value: midpoint}, // ALSO LOL!
	"boundingBox": 	{get: boundingBox}, // TROLLOLOLOL

	"subdivide": 	{value: subdivide},
	"reverse": 		{value: reverse},
	"scale": 		{value: scale},
	"translate": 	{value: translate},

	"draw": 		{value: draw}
});

function midpoint() {
	return this.middle;
}

function subdivide(p) {
	throw "Cannot subdivide a bidirection ray";
}

function reverse() {
	return this;
}

function scale(scalar) {
	throw "Cannot scale a bidirectional ray";
}

function translate(offset) {
	var middle = vec2.clone(this.middle);
	vec2.add(middle, middle, offset);
	return new Line(middle, this.direction);
}

function boundingBox() {
	return Rectangle.point(this.middle);
}

function draw(context) {
	context.arrow(this.middle, this.direction, 0.5);
	context.arrow(this.middle, vec2.scale(vec2(0, 0), this.direction, -1), 0.5);
}
