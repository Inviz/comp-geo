import intersect from '../intersections/Intersections';
import {Vector2 as vec2} from 'nd-linalg';
import LineSegment from './LineSegment';
import Ray from './Ray';
import Rectangle from './Rectangle';
import {roughlyEqual, roughlyBetween} from 'missing-stuff';

export default function Curve(start, direction, end) {
	this.start = start;
	this.end = end;
	this.direction = vec2.clone(direction);
	vec2.normalize(this.direction, this.direction);

	// using the chord vector start-end, find the orientation against direction
	// -1 is counter-clockwise, 1 is clockwise, 0 is either a line or
	// an invalid curve
	var vChord = vec2(0, 0);
	vec2.sub(vChord, this.start, this.end);
	this.orientation = sign(vec2.crossz(this.direction, vChord));

	// an estimate of the curve length, used for computing u,v intersection values
	// and for path finding estimates
	var chordLength = vec2.len(vChord);

	// Check if this is a line
	if (this.orientation === 0) {
		// Determine if the direction faces the same way as the chord,
		// if it doesn't then this is an infinite circle, not a line
		vec2.normalize(vChord, vChord);
		var diff = vec2.add(vec2(0, 0), vChord, this.direction);
		if (!vec2.roughlyEqual(diff, [0, 0]))
			throw "Not a valid curve, infinite circle found";

		//this.length = chordLength;
		//this.__proto__ = LineSegment.constructor.prototype;
		//return;
		return new LineSegment(start, end);
	}

	this.chordLength = chordLength;

	// compute the rays for intersection
	var rayStartToCenter = this.rayFromStartToCenter(),
		rayHalfChordToCenter = this.rayFromHalfChordToCenter();

	// the center of the circle is at the intersection of the two rays
	// but if none exist, then it's not a real circle
	var i = intersect(rayStartToCenter, rayHalfChordToCenter);

	// check the opposite direction in case we're >180º
	if (i.length !== 1) {
		i = intersect(rayStartToCenter, rayHalfChordToCenter.reverse());
	}

	if (i.length !== 1)
		throw "Not a valid curve, no circle found";

	this.center = i[0].p;
	this.radius = vec2.dist(this.center, this.start);

	var angleSpan = 2 * vec2.angleBetween(rayStartToCenter.direction, rayHalfChordToCenter.direction);
	this.length = this.radius * angleSpan;
}

Curve.createIfValid = createIfValid;

function createIfValid(start, direction, end) {
	try {
		return new Curve(start, direction, end);
	} catch (e) {
		return undefined;
	}
};

Object.defineProperties(Curve.prototype, {
	"name": 						{value: "Curve"},
	"type": 						{value: intersect.CurveTypeFunction},
	"isRay": 						{value: false},
	"isLineSegment": 						{value: false},
	"isCurve": 						{value: true},
	"isCircle": 					{value: false},

	"midpoint": 					{get: midpoint},
	"boundingBox": 					{get: boundingBox},
	"endDirection": 				{get: endDirection},

	"rayFromStartToCenter": 		{value: rayFromStartToCenter},
	"rayFromHalfChordToCenter": 	{value: rayFromHalfChordToCenter},

	"subdivide": 					{value: subdivide},
	"reverse": 						{value: reverse},
	"translate": 					{value: translate},
	"scale": 						{value: scale},
	"offsetPerpendicular":			{value: offsetPerpendicular},

	"offsetPerpendicularLength":	{value: offsetPerpendicularLength},
	"mapPerpendicular": 			{value: mapPerpendicular},

	"positionOf": 					{value: positionOf},
	"closestPointTo": 				{value: closestPointTo},
	"offsetOf": 					{value: offsetOf},
	"directionOf": 					{value: directionOf},
	"containsPoint": 				{value: containsPoint},
	"wedgeContainsPoint": 			{value: wedgeContainsPoint},
	"getAlphaValueAtPosition":		{value: getAlphaValueAtPosition},

	"vertices": 					{value: vertices},
	"uvs": 							{value: uvs},
	"draw": 						{value: draw}
});

function midpoint() {
	var direction = this.rayFromHalfChordToCenter().direction;
	vec2.normalize(direction, direction);
	vec2.scale(direction, direction, -this.radius);
	vec2.add(direction, this.center, direction);
	return direction;
}

function boundingBox() {
	var origin = vec2.clone(this.start),
		corner = vec2.clone(this.end),
		midpoint = this.midpoint,
		left = Math.min(this.start[0], this.end[0]),
		left = Math.min(left, midpoint[0]),
		right = Math.max(this.start[0], this.end[0]),
		right = Math.max(right, midpoint[0]),
		top = Math.min(this.start[1], this.end[1]),
		top = Math.min(top, midpoint[1]),
		bottom = Math.max(this.start[1], this.end[1]),
		bottom = Math.max(bottom, midpoint[1]);

	return new Rectangle(top, right, bottom, left);
}

function rayFromStartToCenter() {
	var vStartToCenter = vec2.fromValues(this.direction[1], -this.direction[0]);
	this.orientation === -1 && vec2.negate(vStartToCenter, vStartToCenter);
	return new Ray(this.start, vStartToCenter);
}

function rayFromHalfChordToCenter() {
	var pHalfChord = vec2(0, 0),
		vHalfChord = vec2(0, 0);
	vec2.lerp(pHalfChord, this.start, this.end, 0.5);
	vec2.sub(vHalfChord, pHalfChord, this.start);

	var vHalfChordToCenter = vec2.fromValues(vHalfChord[1], -vHalfChord[0]);
	vec2.normalize(vHalfChordToCenter, vHalfChordToCenter);
	this.orientation === -1 && vec2.negate(vHalfChordToCenter, vHalfChordToCenter);
	return new Ray(pHalfChord, vHalfChordToCenter);
}

function subdivide(p) {
	var head = new Curve(this.start, this.direction, p);
	var tail = new Curve(p, this.directionOf(this.offsetOf(p)), this.end);
	return [head, tail];
}

function reverse() {
	return new Curve(this.end, vec2.negate(vec2(0, 0), this.endDirection), this.start);
}

function scale(scalar) {
	var start = vec2.clone(this.start),
		end = vec2.clone(this.end);
	vec2.scale(start, start, scalar);
	vec2.scale(end, end, scalar);
	return new Curve(start, this.direction, end);
}

function translate(offset) {
	var start = vec2.clone(this.start),
		end = vec2.clone(this.end);
	vec2.add(start, start, offset);
	vec2.add(end, end, offset);
	return new Curve(start, this.direction, end);
}

function directionOf(offset) {
	var rotationSign = -this.orientation;
	var centerToStart = vec2.sub(vec2(0, 0), this.start, this.center);
	var centerToPoint = vec2.rotate(vec2(0, 0), centerToStart, rotationSign * offset / this.radius);

	var direction = this.orientation > 0
		? vec2.fromValues(centerToPoint[1], -centerToPoint[0])
		: vec2.fromValues(-centerToPoint[1], centerToPoint[0]);

	vec2.normalize(direction, direction);

	return direction;
}

function endDirection() {
	var vEnd = vec2(0, 0);
	vec2.sub(vEnd, this.center, this.end);
	var direction = this.orientation > 0
		? vec2.fromValues(-vEnd[1], vEnd[0])
		: vec2.fromValues(vEnd[1], -vEnd[0]);
	return vec2.normalize(direction, direction);
}

function containsPoint(p) {
	var distance = vec2.squaredDistance(this.center, p);
	return (distance <= this.radius * this.radius + Intersections.THICKNESS * Intersections.THICKNESS)
		&& this.wedgeContainsPoint(p, Intersections.THICKNESS);
}

function wedgeContainsPoint(p, tolerance) {
	// The point (p) must lye between start and end vectors
	// let start = 0, 0
	// let end = this.end - this.start
	// let test = p - this.start
	// let dir = this.direction
	// sign0 = sign(dir x end)
	//   sign0 == 0 error: all points are either inside or outside and it's impossile to tell
	// sign1 = sign(dir x test) <
	// sign2 = sign(test x end)
	// contained if:
	//    sign1 == 0 || sign2 == 0 
	//    sign0 == sign1 && sign0 == sign2

	var test = vec2(0, 0),
		endToStart = vec2(0, 0),
		dir = tolerance ? this.directionOf(-tolerance) : this.direction;

	let start = tolerance ? this.positionOf(-tolerance) : this.start;
	let end = tolerance ? this.positionOf(this.length + tolerance) : this.end;

	vec2.sub(test, p, start);
	vec2.sub(endToStart, end, start);

	var sign0 = sign(vec2.crossz(dir, endToStart));
	var sign1 = sign(vec2.crossz(dir, test));
	var sign2 = sign(vec2.crossz(test, endToStart));
	//console.log("dir", dir, "end", end, "test", test, "sign0", sign0, "sign1", sign1, "sign2", sign2);

	// All or no solutions because there is no arc, this should not be possible, it should
	// have been caught on curve creation
	if (sign0 === 0)
		throw "This curve has no wedge";

	// Solution because the test is on an edge of the wedge
	if (sign1 === 0 || sign2 === 0)
		return true;

	return sign0 === sign1 && sign0 === sign2;
}

function getAlphaValueAtPosition(p) {
	return this.offsetOf(p) / this.length;
}

function sign(value) {
	return roughlyEqual(value, 0)
		? 0
		: value > 0
			? 1
			: -1;
}

function offsetOf(point) {
	var tolerance = 1e-3;
	var centerToStart = vec2.sub(vec2(0, 0), this.start, this.center);
	var centerToPoint = vec2.sub(vec2(0, 0), point, this.center);
	var centerToEnd = vec2.sub(vec2(0, 0), this.end, this.center);

	var angleSpan = this.length / this.radius;

	var directionAtPoint = this.orientation > 0
		? vec2.fromValues(centerToPoint[1], -centerToPoint[0])
		: vec2.fromValues(-centerToPoint[1], centerToPoint[0]);
	var angleAToPoint = vec2.angleBetweenWithDirections(
		centerToStart, this.direction, centerToPoint);
	var angleBToPoint = vec2.angleBetweenWithDirections(
		centerToPoint, directionAtPoint, centerToEnd);

	return angleAToPoint <= angleSpan + tolerance && angleBToPoint <= angleSpan + tolerance
		? angleAToPoint * this.radius
		: vec2.dist(this.start, point) < vec2.dist(this.end, point)
			? -vec2.angleBetween(centerToStart, centerToPoint) * this.radius
			: this.length + vec2.angleBetween(centerToEnd, centerToPoint) * this.radius;
}

function closestPointTo(point) {
	var offset = this.offsetOf(point);
	if (roughlyBetween(0, offset, this.length)) {
		var centerToPoint = vec2.sub(vec2(0, 0), point, this.center);
		return vec2.add(centerToPoint, centerToPoint, this.center, vec2.scale(
			centerToPoint, centerToPoint,
			this.radius / vec2.len(centerToPoint)
		));
	}

	if (vec2.dist(this.start, point) < vec2.dist(this.end, point)) {
		return this.start;
	} else {
		return this.end;
	}
}

function positionOf(offset) {
	var rotationSign = -this.orientation;
	var centerToStart = vec2.sub(vec2(0, 0), this.start, this.center);
	var centerToPoint = vec2.rotate(vec2(0, 0), centerToStart, rotationSign * offset / this.radius);
	return vec2.add(centerToPoint, centerToPoint, this.center);
}

function offsetPerpendicular(offsetToRight) {
	return Curve.createIfValid(
		vec2.scalePerpendicularAndAdd(vec2(0, 0), this.start, this.direction, offsetToRight),
		this.direction,
		vec2.scalePerpendicularAndAdd(vec2(0, 0), this.end, this.endDirection, offsetToRight)
	);
}

function offsetPerpendicularLength(offsetToRight) {
	if (offsetToRight === 0) return this.length;
	var angleSpan = this.length / this.radius;
	return this.length + (this.orientation < 0 ? 1 : -1) * angleSpan * offsetToRight;
}

function mapPerpendicular(offsetA, offsetToRightA, offsetToRightB) {
	// TODO: maybe simplify?
	return offsetA * (
		this.offsetPerpendicularLength(offsetToRightB) /
		this.offsetPerpendicularLength(offsetToRightA));
}

var DEBUG_CURVE_DISPLAY = false;
function draw(context) {
	if (this.radius === 0) return;

	// Draw the full circle
	DEBUG_CURVE_DISPLAY && context.stroke(new Circle(this.center, this.radius));

	// Draw the arrow head at the end of the arc
	context.arrowhead(this.end, this.endDirection);
	context.stroke(this);
}

function vertices(offsetToRight) {
	var centerToStart = vec2.sub(vec2(0, 0), this.start, this.center);

	if (offsetToRight) {
		var desiredRadius = this.orientation > 0
			? this.radius - offsetToRight
			: this.radius + offsetToRight;
		var scaling = desiredRadius / this.radius;
		vec2.scale(centerToStart, centerToStart, scaling);
	}

	var angleSpan = this.length / this.radius;
	// TODO: make less magic
	var subdivisions = Math.ceil(Math.abs(angleSpan) * 4 * (Math.abs(this.radius)/100 + 1)) + 1;
	var vertices = new Array(subdivisions);
	var rotationSign = -this.orientation;
	var rotationMatrix = mat2.rotation(rotationSign * angleSpan * (1 / (subdivisions - 1)));
	var pointer = vec2.clone(centerToStart);

	for (var i = 0; i < subdivisions; i++) {
		vertices[i] = vec2.add(vec2(0, 0), pointer, this.center);
		mat2.map(pointer, rotationMatrix, pointer);
	}

	return vertices;
}

function uvs(offsetToRight, multiplierAlongPath) {
	var angleSpan = this.length / this.radius;
	// TODO: make less magic
	var subdivisions = Math.ceil(Math.abs(angleSpan) * 4 * (Math.abs(this.radius)/100 + 1)) + 1;

	var uvs = new Array(subdivisions);

	for (var i = 0; i < subdivisions; i++) {
		uvs[i] = vec2.fromValues(multiplierAlongPath * this.length * (i / (subdivisions - 1)), offsetToRight);
	}

	return uvs;
}
