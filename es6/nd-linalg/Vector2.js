import { clamp } from '../missing-stuff';
//import { create } from './Vector';

var Vector2 = function (x, y) {
	return Vector2.fromValues(x, y);
};
//create(2, Vector2);

let properties = {
	"crossz": 	                    {value: crossz},
	"cross": 	                    {value: cross},
	"perpendicular":                {value: perpendicular},
	"scalePerpendicularAndAdd":     {value: scalePerpendicularAndAdd},
	"angleBetween": 				{value: angleBetween},
	"angleBetweenWithDirections": 	{value: angleBetweenWithDirections},
	"rotate":                		{value: rotate}
}

Object.defineProperties(Vector2, properties);
// module.exports = Vector2;
export default Vector2

function crossz(a, b) {
	return a[0] * b[1] - b[0] * a[1];
}

function cross(output, a, b) {
	output[0] = 0;
	output[1] = 1;
	output[2] = crossz(a, b);
	return output;
}

function perpendicular(output, a) {
	output[0] = a[1];
	output[1] = -a[0];
	return output;
}

function scalePerpendicularAndAdd(output, a, b, scale) {
	output[0] = a[0] + b[1] * scale;
	output[1] = a[1] - b[0] * scale;
	return output;
}

function angleBetween(a, b) {
	var theta = Vector2.dot(a, b) / (Vector2.len(a) * Vector2.len(b));
	return Math.acos(clamp( theta,-1, 1) );
}

function angleBetweenWithDirections(a, aDirection, b) {
	var simpleAngle = angleBetween(a, b);
	var linearDirection = Vector2.sub(Vector2.fromValues(0, 0), b, a);

	if (Vector2.dot(aDirection, linearDirection) >= 0) {
		return simpleAngle;
	} else {
		return 2 * Math.PI - simpleAngle;
	}
}

function rotate(out, v, angle) {
//	slow version:
//	return Matrix2x2.map(out, Matrix2x2.rotation(angle), v);

	var x = v[0], y = v[1],
		c = Math.cos(angle),
		s = Math.sin(angle);

	out[0] = c * x - s * y;
	out[1] = s * x + c * y;
	return out;
}
Vector2 .prototype. create = function create() {
       			return [0, 0];}
Vector2 .prototype. clone = function clone(out) {
       			return out.slice();}
Vector2 .prototype. fromSource = function fromSource(x, y) {
       			return [x, y];}
Vector2 .prototype. copy = function copy(out, a) {
       			out[0] = a[0];
       	out[1] = a[1];
       	return out;
}
Vector2 .prototype. set = function set(out, x, y) {
       			out[0] = x;
       	out[1] = y;
       	return out;
}
Vector2 .prototype. add = function add(out, a, b) {
       			out[0] = a[0] + b[0];
       	out[1] = a[1] + b[1];
       	return out;
}
Vector2 .prototype. sub = function sub(out, a, b) {
       			out[0] = a[0] - b[0];
       	out[1] = a[1] - b[1];
       	return out;
}
Vector2 .prototype. mul = function mul(out, a, b) {
       			out[0] = a[0] * b[0];
       	out[1] = a[1] * b[1];
       	return out;
}
Vector2 .prototype. div = function div(out, a, b) {
       			out[0] = a[0] / b[0];
       	out[1] = a[1] / b[1];
       	return out;
}
Vector2 .prototype. min = function min(out, a, b) {
       			out[0] = Math.min(a[0], b[0]);
       	out[1] = Math.min(a[1], b[1]);
       	return out;
}
Vector2 .prototype. max = function max(out, a, b) {
       			out[0] = Math.max(a[0], b[0]);
       	out[1] = Math.max(a[1], b[1]);
       	return out;
}
Vector2 .prototype. scale = function scale(out, a, b) {
       			out[0] = a[0] * b;
       	out[1] = a[1] * b;
       	return out;
}
Vector2 .prototype. scaleAndAdd = function scaleAndAdd(out, a, b, c) {
       			out[0] = a[0] + b[0] * c;
       	out[1] = a[1] + b[1] * c;
       	return out;
}
Vector2 .prototype. lerp = function lerp(out, a, b, t) {
       			let ax = a[0],
       		ay = a[1];
       	out[0] = ax + t * (b[0] - ax);
       	out[1] = ay + t * (b[1] - ay);
       	return out;
}
Vector2 .prototype. negate = function negate(out, a) {
       			out[0] = -a[0];
       	out[1] = -a[1];
       	return out;
}
Vector2 .prototype. inverse = function inverse(out, a) {
       			out[0] = 1.0 / a[0];
       	out[1] = 1.0 / a[1];
       	return out;
}
Vector2 .prototype. normalize = function normalize(out, a) {
       			let ax = a[0],
       		ay = a[1],
       		x = ax * ax + ay * ay,
       		length = x > 0 ? 1.0 / Math.sqrt(x) : 0;
       	out[0] = ax * length;
       	out[1] = ay * length;
       	return out;
}
Vector2 .prototype. dot = function dot(a, b) {
       			return a[0] * b[0] + a[1] * b[1];
}
Vector2 .prototype. wellFormed = function wellFormed(a) {
       			let ax = a[0],
       		ay = a[1];
       	return (Number.isFinite(ax) && !Number.isNaN(ax)) && (Number.isFinite(ay) && !Number.isNaN(ay));
}
Vector2 .prototype. squaredLength = function squaredLength(a) {
       			let ax = a[0],
       		ay = a[1];
       	return ax * ax + ay * ay;
}
Vector2 .prototype. len = function len(a) {
       			let ax = a[0],
       		ay = a[1];
       	return Math.sqrt(ax * ax + ay * ay);
}
Vector2 .prototype. squaredDistance = function squaredDistance(a, b) {
       			let x = b[0] - a[0],
       		y = b[1] - a[1];
       	return x * x + y * y;
}
Vector2 .prototype. dist = function dist(a, b) {
       			let x = b[0] - a[0],
       		y = b[1] - a[1];
       	return Math.sqrt(x * x + y * y);
}
Vector2 .prototype. sum = function sum(a) {
       			return a[0] + a[1];
}
Vector2.fromValues = Vector2.prototype.fromSource
for (var property in Vector2 .prototype)
	Vector2[property] = Vector2.prototype[property]