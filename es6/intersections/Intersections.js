import { assert } from '../missing-stuff';
import {theta as AngleTheta} from '../helpers/Angles';
import vec2 from '../nd-linalg/Vector2';
import {clamp, between, roughlyEqual, roughlyEqualVec2, ROUGHLY_EPSILON} from '../missing-stuff';

export default intersect;

function Intersection(x, y, u, v) {
	this.p = vec2.fromValues(x, y);
	this.u = u;
	this.v = v;
}

Object.defineProperties(Intersection.prototype,	{
	"isDegenerate": 	{get: function() { return this.uIsDegenerate || this.vIsDegenerate; }},
	"uIsDegenerate": 	{get: function() { return roughlyEqual(this.u, 0) || roughlyEqual(this.u, 1); }},
	"vIsDegenerate": 	{get: function() { return roughlyEqual(this.v, 0) || roughlyEqual(this.v, 1); }},

	"boundingBox": 		{get: boundingBox},
	"draw": 			{value: draw}
});

function boundingBox() {
	return Rectangle.corner(this.p, this.p);
}

function draw(context) {
	context.dot(this.p);
}

function tidydown(number) {
	// if the number is < 0 but > -EPSILON then make it 0
	if (number < 0 && number > -ROUGHLY_EPSILON)
		return 0;
	return number;
}

function tidyup(number) {
	// if the number is > 1 but < 1 + EPSILON then make it 1
	if (number > 1 && number < (1 + ROUGHLY_EPSILON))
		return 1;
	return number;
}

const THICKNESS = 0.03;
export {THICKNESS};

function pointToLineDistance(point, start, direction) {
	let perpendicularDirection = vec2.perpendicular(vec2(0, 0), direction);
	return Math.abs(vec2.dot(vec2.sub(vec2(0, 0), point, start), perpendicularDirection));
}

// http://stackoverflow.com/questions/2931573/determining-if-two-rays-intersect
function rayRayIntersections(a, b) {
	var det = b.direction[0] * a.direction[1] - b.direction[1] * a.direction[0];

	// Parallel, overlap or no intersection
	if (roughlyEqual(det, 0)) {
		// edge case: same start position
		if (roughlyEqualVec2(a.start, b.start, THICKNESS))
			return [new Intersection(a.start[0], a.start[1], 0, 0)];

		// not facing the same direction
		if (!roughlyEqualVec2(a.direction, b.direction)) return [];

		// too far apart
		if (pointToLineDistance(a.start, b.start, b.direction) > THICKNESS) return [];

		// a contains b or b contains a depending on the
		// direction from a.start to b.start
		var bToA = vec2(0, 0);
		vec2.sub(bToA, b.start, a.start);
		vec2.normalize(bToA, bToA);
		if (roughlyEqualVec2(a.direction, bToA))
			return [new Intersection(b.start[0], b.start[1], 0, 0)];
		else
			return [new Intersection(a.start[0], a.start[1], 0, 0)];
	}

	var dx = b.start[0] - a.start[0];
	var dy = b.start[1] - a.start[1];
	var u = (dy * b.direction[0] - dx * b.direction[1]) / det;
	var v = (dy * a.direction[0] - dx * a.direction[1]) / det;

	// No intersection
	if (u < -THICKNESS || v < -THICKNESS)
		return [];

	if (u < 0 && u > -THICKNESS) u = 0;
	if (v < 0 && v > -THICKNESS) v = 0;

	return [new Intersection(a.start[0] + u * a.direction[0], a.start[1] + u * a.direction[1], u, v)];
}

function lineLineIntersections(a, b) {
	var det = b.direction[0] * a.direction[1] - b.direction[1] * a.direction[0];

	// Parallel, overlap or no intersection
	if (roughlyEqual(det, 0)) {
		// edge case: same start position
		if (roughlyEqualVec2(a.middle, b.middle, THICKNESS))
			return [new Intersection(a.middle[0], a.middle[1], 0, 0)];

		// too far apart
		if (pointToLineDistance(a.middle, b.middle, b.direction) > THICKNESS) return [];

		// a contains b or b contains a depending on the
		// direction from a.middle to b.middle
		var c = vec2(0, 0);
		vec2.sub(c, b.middle, a.middle);
		vec2.normalize(c, c);
		if (roughlyEqualVec2(a.direction, c))
			return [new Intersection(b.middle[0], b.middle[1], 0, 0)];
		else
			return [new Intersection(a.middle[0], a.middle[1], 0, 0)];
	}

	var dx = b.middle[0] - a.middle[0];
	var dy = b.middle[1] - a.middle[1];
	var u = (dy * b.direction[0] - dx * b.direction[1]) / det;
	var v = (dy * a.direction[0] - dx * a.direction[1]) / det;

	return [new Intersection(a.middle[0] + u * a.direction[0], a.middle[1] + u * a.direction[1], u, v)];
}

function lineRayIntersections(a, b) { return swapuv(rayLineIntersections(b, a)); }
function rayLineIntersections(a, b) {
	var det = b.direction[0] * a.direction[1] - b.direction[1] * a.direction[0];

	// Parallel, overlap or no intersection
	if (roughlyEqual(det, 0)) {
		// edge case: same start position
		if (roughlyEqualVec2(a.start, b.middle, THICKNESS))
			return [new Intersection(a.start[0], a.start[1], 0, 0)];

		// too far apart
		if (pointToLineDistance(a.start, b.middle, b.direction) > THICKNESS) return [];

		// a contains b or b contains a depending on the
		// direction from a.start to b.middle
		var c = vec2(0, 0);
		vec2.sub(c, b.middle, a.start);
		vec2.normalize(c, c);
		if (roughlyEqualVec2(a.direction, c))
			return [new Intersection(b.middle[0], b.middle[1], 0, 0)];
		else
			return [new Intersection(a.start[0], a.start[1], 0, 0)];
	}

	var dx = b.middle[0] - a.start[0];
	var dy = b.middle[1] - a.start[1];
	var u = (dy * b.direction[0] - dx * b.direction[1]) / det;
	var v = (dy * a.direction[0] - dx * a.direction[1]) / det;

	// No intersection
	if (u < -THICKNESS)
		return [];

	if (u < 0 && u > -THICKNESS) u = 0;

	return [new Intersection(a.start[0] + u * a.direction[0], a.start[1] + u * a.direction[1], u, v)];
}

function lineSegmentRayIntersections(line, ray) { return swapuv(rayLineSegmentIntersections(ray, line)); }
function rayLineSegmentIntersections(ray, line) {
	var potentials = rayRayIntersections(ray, line),
		lineLength = line.length,
		intersects = [];
	for (let potential of potentials) {
		if (potential.v <= lineLength + THICKNESS) {
			potential.v /= lineLength;
			potential.v = Math.min(potential.v, 1);
			intersects.push(potential);
		}
	}
	return intersects;
}

function lineSegmentLineSegmentIntersections(a, b) {
	var da = vec2.sub(vec2(0, 0), a.end, a.start);
	var db = vec2.sub(vec2(0, 0), b.end, b.start);
	var na = vec2.normalize(vec2(0, 0), da);
	var nb = vec2.normalize(vec2(0, 0), db);
	var orientation = vec2.crossz(na, nb);

	// Parallel - overlapping or no intersection
	if (roughlyEqual(orientation, 0)) {
		// too far apart
		if (pointToLineDistance(a.start, b.start, b.direction) > THICKNESS) return [];

		// edge case: both lines have zero length
		if (roughlyEqual(a.length, 0) && roughlyEqual(b.length, 0))
			return [];

		// sort the positions by either the x-coordinate, or y-coordinate if they
		// share the same x-coordinate. If they share the same x and y coordinates
		// then the shared point test later will pick it up.
		// this will leave the sorted array as:
		//     [outside, inside, inside, outside]
		//     [n/a, shared, shared, n/a]
		//     [n/a, shared, inside, outside]
		//     [outside, inside, shared, n/a]
		// or for the case where there is no intersection
		//     [outside, outside, outside, outside]
		var sorted = [
			{id: 0, position: a.start},
			{id: 1, position: a.end},
			{id: 2, position: b.start},
			{id: 3, position: b.end}
		];
		if (roughlyEqual(a.start[0], a.end[0], THICKNESS) && roughlyEqual(b.start[0], b.end[0], THICKNESS)) {
			sorted.sort(function(q, r) { return q.position[1] > r.position[1]; });
		} else {
			sorted.sort(function(q, r) { return q.position[0] > r.position[0]; });
		}

		// Shared point in the center
		if (roughlyEqualVec2(sorted[1].position, sorted[2].position, THICKNESS)) {
			var position = sorted[1].position;
			return [new Intersection(
				position[0],
				position[1],
				a.getAlphaValueAtPosition(position),
				b.getAlphaValueAtPosition(position))];
		}

		// Check if the first two points in the sorted set are (a.start, a.end), or (b.start, b.end)
		// indicating that the two lines do not overlap
		var order = sorted[0].id + sorted[1].id;
		if (order == 1 || order == 5)
			return [];

		var position1 = sorted[1].position,
			position2 = sorted[2].position,
			u1 = a.getAlphaValueAtPosition(position1),
			v1 = b.getAlphaValueAtPosition(position1),
			u2 = a.getAlphaValueAtPosition(position2),
			v2 = b.getAlphaValueAtPosition(position2);

		return [
			new Intersection(position1[0], position1[1], u1, v1),
			new Intersection(position2[0], position2[1], u2, v2)
		];
	}

	var determinant = vec2.crossz(db, da);
	var u = ((db[0] * (b.start[1] - a.start[1])) - (db[1] * (b.start[0] - a.start[0]))) / determinant;
	var v = ((da[0] * (b.start[1] - a.start[1])) - (da[1] * (b.start[0] - a.start[0]))) / determinant;
	//u = tidydown(tidyup(u));
	//v = tidydown(tidyup(v));

	// No intersection
	// TODO: for flat angles this approximation is stupid
	// u might be much further away from 0 than -Thickness,
	// even when lines are just thickness apart
	const uTolerance = THICKNESS / vec2.len(da);
	const vTolerance = THICKNESS / vec2.len(db);
	if (!between(-uTolerance, u, 1 + uTolerance)) return [];
	if (!between(-vTolerance, v, 1 + vTolerance)) return [];

	u = clamp(0, u, 1);
	v = clamp(0, v, 1);

	var p = vec2(0, 0);
	vec2.lerp(p, a.start, a.end, u);
	return [new Intersection(p[0], p[1], u, v)];
}

function circleLineSegmentIntersections(circle, line) { return swapuv(lineSegmentCircleIntersections(line, circle)) }
function lineSegmentCircleIntersections(line, circle) {
	var dp = vec2(0, 0);
	vec2.sub(dp, line.end, line.start);
	var a = vec2.squaredLength(dp);
	var b = 2 * (dp[0] * (line.start[0] - circle.center[0]) + dp[1] * (line.start[1] - circle.center[1]));
	var c = vec2.squaredLength(circle.center);
	c += vec2.squaredLength(line.start);
	c -= 2 * (circle.center[0] * line.start[0] + circle.center[1] * line.start[1]);
	var cCenter = c - circle.radius * circle.radius;
	var cInner = c - (circle.radius * circle.radius - THICKNESS * THICKNESS);
	var cOuter = c - (circle.radius * circle.radius + THICKNESS * THICKNESS);
	var bb4acCenter = b * b - 4 * a * cCenter;
	var bb4acInner = b * b - 4 * a * cInner;
	var bb4acOuter = b * b - 4 * a * cOuter;

	// No intersection
	if (Math.abs(a) <= ROUGHLY_EPSILON || (bb4acCenter < 0 && bb4acInner < 0 && bb4acOuter < 0))
		return [];

	var s1Center = (-b + Math.sqrt(bb4acCenter)) / (2 * a);
	var s2Center = (-b - Math.sqrt(bb4acCenter)) / (2 * a);
	var s1Inner = (-b + Math.sqrt(bb4acInner)) / (2 * a);
	var s2Inner = (-b - Math.sqrt(bb4acInner)) / (2 * a);
	var s1Outer = (-b + Math.sqrt(bb4acOuter)) / (2 * a);
	var s2Outer = (-b - Math.sqrt(bb4acOuter)) / (2 * a);

	var s1 = between(0, s1Center, 1) ? s1Center : between(0, s1Outer, 1) ? s1Outer : s1Inner;
	var s2 = between(0, s2Center, 1) ? s2Center : between(0, s2Outer, 1) ? s2Outer : s2Inner;

	var solution1exists = between(0, s1, 1);
	var solution2exists = !roughlyEqual(s1, s2) && between(0, s2, 1);
	var solution1, solution2;
	var p = vec2(0, 0);

	// Solution 1
	if (solution1exists) {
		solution1 = new Intersection(line.start[0] + s1 * dp[0], line.start[1] + s1 * dp[1], s1, null);
		vec2.sub(p, solution1.p, circle.center);
		solution1.v = AngleTheta(p);
		if (!solution2exists)
			return [solution1];
	} else {
		if (!solution2exists)
			return [];
	}

	// Solution 2
	if (solution2exists) {
		solution2 = new Intersection(line.start[0] + s2 * dp[0], line.start[1] + s2 * dp[1], s2, null);
		vec2.sub(p, solution2.p, circle.center);
		solution2.v = AngleTheta(p);
		if (!solution1exists)
			return [solution2];
	}

	return [solution1, solution2];
}

function curveLineSegmentIntersections(curve, line) { return swapuv(lineSegmentCurveIntersections(line, curve)) }
function lineSegmentCurveIntersections(line, curve) {
	//throw "No!!"
	var potentials = lineSegmentCircleIntersections(line, curve);
	var intersections = [];
	for (var i = 0; i < potentials.length; i++) {
		var intersection = potentials[i];
		if (curve.wedgeContainsPoint(intersection.p, THICKNESS)) {
			intersection.v = curve.getAlphaValueAtPosition(intersection.p);
			intersection.u = clamp(0, intersection.u, 1);
			intersection.v = clamp(0, intersection.v, 1);
			intersections.push(intersection);
		}
	}
	return intersections;
}

function circleCircleIntersections(a, b) {
	var c0 = a.center;
	var c1 = b.center;
	var r0 = a.radius;
	var r1 = b.radius;
	var d = vec2.dist(c0, c1);

	// No solution, circles are the same
	if (d == 0 && r0 == r1)
		return [];

	// No solution, circles do not intersect
	if (d > (r0 + r1))
		return [];

	// No solution, one circle inside the other
	if (d < Math.abs(r0 - r1))
		return [];

	// Determine the distance from center c0 to centroid
	var c = (r0 * r0 - r1 * r1 + d * d) / (2 * d);

	// Determine the distance from centroid to either intersection point
	var h = Math.sqrt(r0 * r0 - c * c);

	// Determine position of centroid
	var dx = c1[0] - c0[0];
	var dy = c1[1] - c0[1];
	var cx = c0[0] + (dx * c / d);
	var cy = c0[1] + (dy * c / d);

	// Determine the offset vector from the centroid to the intersection points
	var rx = -dy * h / d;
	var ry = dx * h / d;

	"Solution 1"
	var p = vec2(0, 0);
	var solution1 = new Intersection(cx + rx, cy + ry, 0, 0);
	vec2.sub(p, solution1.p, c0);
	solution1.u = AngleTheta(p);
	vec2.sub(p, solution1.p, c1);
	solution1.v = AngleTheta(p);

	if (roughlyEqual(h, 0))
		return [solution1];

	"Solution 2"
	var solution2 = new Intersection(cx - rx, cy - ry, 0, 0);
	vec2.sub(p, solution2.p, c0);
	solution2.u = AngleTheta(p);
	vec2.sub(p, solution2.p, c1);
	solution2.v = AngleTheta(p);
	return [solution1, solution2];
}

function curveCurveIntersections(a, b) {
	var intersections = [];

	if (roughlyEqualVec2(a.center, b.center, THICKNESS)
		&& roughlyEqual(a.radius, b.radius, THICKNESS)) {
		if (a.wedgeContainsPoint(b.start, THICKNESS))
			intersections.push(
				new Intersection(b.start[0], b.start[1], a.getAlphaValueAtPosition(b.start), 0));

		if (a.wedgeContainsPoint(b.end, THICKNESS))
			intersections.push(
				new Intersection(b.end[0], b.end[1], a.getAlphaValueAtPosition(b.end), 1));

		if (intersections.length == 2)
			return intersections;

		if (b.wedgeContainsPoint(a.start, THICKNESS))
			intersections.push(
				new Intersection(a.start[0], a.start[1], 0, b.getAlphaValueAtPosition(a.start)));

		if (intersections.length == 2)
			return intersections;

		if (b.wedgeContainsPoint(a.end, THICKNESS))
			intersections.push(
				new Intersection(a.end[0], a.end[1], 1, b.getAlphaValueAtPosition(a.end)));

		return intersections;
	}

	var potentials = circleCircleIntersections(a, b);
	for (var i = 0; i < potentials.length; i++) {
		var intersection = potentials[i];
		//console.log("curve-curve potential", intersection);
		if (a.wedgeContainsPoint(intersection.p, THICKNESS) &&
			b.wedgeContainsPoint(intersection.p, THICKNESS)) {
			intersection.u = a.getAlphaValueAtPosition(intersection.p);
			intersection.v = b.getAlphaValueAtPosition(intersection.p);
			intersections.push(intersection);
		}
	}
	return intersections;
}

function swapuv(intersections) {
	for (var i = 0; i < intersections.length; i++) {
		var intersection = intersections[i],
			u = intersection.u,
			v = intersection.v;
		intersection.u = v;
		intersection.v = u;
	}
	return intersections;
}

function notYetImplemented(a, b) {
	throw "Intersection combination not yet implemented";
}

// RAY = 1 and 2
// LINE_SEGMENT = 4 and 8
// CIRCLE = 16 and 32
// CURVE = 64 and 128
//
// RAY(1) + RAY(2) = 3
// RAY(1) + LINE_SEGMENT(4) = 5
// LINE_SEGMENT(4) + RAY(2) = 6
// LINE_SEGMENT(4) + LINE_SEGMENT(8) = 12
// LINE_SEGMENT(4) + CIRCLE(16) = 20
// CIRCLE(16) + LINE_SEGMENT(8) = 24
// CIRCLE(16) + CIRCLE(32) = 48
// etc
var intersections = [];
function intersectionTypeLookup(a, b) { return a + 2 * b }
function intersectionTypeInstall(a, b, f) {
	var type = intersectionTypeLookup(a, b);
	assert(intersections[type] == null);
	intersections[type] = f;
}

var RAY = 1;
var LINE = 4;
var LINE_SEGMENT = 16;
var CIRCLE = 64;
var CURVE = 256;
intersectionTypeInstall(RAY         , RAY         , rayRayIntersections);
intersectionTypeInstall(RAY         , LINE        , rayLineIntersections);
intersectionTypeInstall(RAY         , LINE_SEGMENT, rayLineSegmentIntersections);
intersectionTypeInstall(LINE        , LINE        , lineLineIntersections);
intersectionTypeInstall(LINE        , RAY         , lineRayIntersections);
intersectionTypeInstall(LINE_SEGMENT, RAY         , lineSegmentRayIntersections);
intersectionTypeInstall(LINE_SEGMENT, LINE_SEGMENT, lineSegmentLineSegmentIntersections);
intersectionTypeInstall(LINE_SEGMENT, CIRCLE      , lineSegmentCircleIntersections);
intersectionTypeInstall(LINE_SEGMENT, CURVE       , lineSegmentCurveIntersections);
intersectionTypeInstall(CIRCLE      , LINE_SEGMENT, circleLineSegmentIntersections);
intersectionTypeInstall(CIRCLE      , CIRCLE      , circleCircleIntersections);
intersectionTypeInstall(CURVE       , LINE_SEGMENT, curveLineSegmentIntersections);
intersectionTypeInstall(CURVE       , CURVE       , curveCurveIntersections);

function intersect(a, b) {
	// I know what you're thinking. I've thought the same thing
	// quite a few times myself. You're here because of an exception
	// or perhaps you're just reading the code. If you're just
	// reading the code then you're thinking this is an odd kind of
	// comment to stumble upon. If you're here because of an
	// exception you're thinking gee I wish there was a catch here
	// to make sure 'a' and 'b' are actually geometric objects that
	// we can measure the intersection between. You must resist the
	// temptation to add such a test because intersect() is called
	// all over the place, constantly and in many tight loops. Your
	// real issue is somewhere else up in the stack. Go look there,
	// not here. Here you will find no answers, only pain and
	// suffering and darkness and all that other stuff the Jedi
	// want you to believe about the dark side that clearly isn't
	// true. The dark side just wants us to be ourselves, to feel
	// our emotions and learn to be responsible with it. It's that
	// Lucas fellow and his strange 'light side' and 'dark side'
	// biases that have fooled so much of the world in to believing
	// that the dark side only leads to gibbering power hungry
	// idiots with no self control and that somehow living a life
	// without love, with attachments, is the ultimate way to be
	// in touch with the force. I've digressed. The point is, you
	// don't want to look here, your issue is elsewhere.
	var type = intersectionTypeLookup(a.type(), b.type());
	return intersections[type](a, b);
};

intersect.RayTypeFunction = function() { return RAY; }
intersect.RayTypeFunction.typeName = "ray";
intersect.LineTypeFunction = function() { return LINE; }
intersect.RayTypeFunction.typeName = "line";
intersect.LineSegmentTypeFunction = function() { return LINE_SEGMENT; }
intersect.LineSegmentTypeFunction.typeName = "lineSegment";
intersect.CircleTypeFunction = function() { return CIRCLE; }
intersect.CircleTypeFunction.typeName = "circle";
intersect.CurveTypeFunction = function() { return CURVE; }
intersect.CurveTypeFunction.typeName = "curve";
