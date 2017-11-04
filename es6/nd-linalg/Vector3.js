//import { create } from './Vector';
var Vector3 = function (x, y, z) {
	return Vector3.fromValues(x, y, z);
};

//create(3, Vector3);
Object.defineProperties(Vector3, {
	"cross": 	{value: cross}
});
export default Vector3

function cross(output, a, b) {
	var ax = a[0], ay = a[1], az = a[2],
		bx = b[0], by = b[1], bz = a[2];

	output[0] = ay * bz - az * by;
	output[1] = az * bx - ax * bz;
	output[2] = ax * by - ay * bx;
	return output;
}

Vector3 .prototype. create = function create() {
            return [0, 0, 0];}
Vector3 .prototype. clone = function clone(out) {
            return out.slice();}
Vector3 .prototype. fromSource = function fromSource(x, y, z) {
            return [x, y, z];}
Vector3 .prototype. copy = function copy(out, a) {
            out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
}
Vector3 .prototype. set = function set(out, x, y, z) {
            out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
}
Vector3 .prototype. add = function add(out, a, b) {
            out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
}
Vector3 .prototype. sub = function sub(out, a, b) {
            out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
}
Vector3 .prototype. mul = function mul(out, a, b) {
            out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
}
Vector3 .prototype. div = function div(out, a, b) {
            out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
        return out;
}
Vector3 .prototype. min = function min(out, a, b) {
            out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
}
Vector3 .prototype. max = function max(out, a, b) {
            out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
}
Vector3 .prototype. scale = function scale(out, a, b) {
            out[0] = a[0] * b;
        out[1] = a[1] * b;
        out[2] = a[2] * b;
        return out;
}
Vector3 .prototype. scaleAndAdd = function scaleAndAdd(out, a, b, c) {
            out[0] = a[0] + b[0] * c;
        out[1] = a[1] + b[1] * c;
        out[2] = a[2] + b[2] * c;
        return out;
}
Vector3 .prototype. lerp = function lerp(out, a, b, t) {
            let ax = a[0],
          ay = a[1],
          az = a[2];
        out[0] = ax + t * (b[0] - ax);
        out[1] = ay + t * (b[1] - ay);
        out[2] = az + t * (b[2] - az);
        return out;
}
Vector3 .prototype. negate = function negate(out, a) {
            out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
}
Vector3 .prototype. inverse = function inverse(out, a) {
            out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        out[2] = 1.0 / a[2];
        return out;
}
Vector3 .prototype. normalize = function normalize(out, a) {
            let ax = a[0],
          ay = a[1],
          az = a[2],
          x = ax * ax + ay * ay + az * az,
          length = x > 0 ? 1.0 / sqrt(x) : 0;
        out[0] = ax * length;
        out[1] = ay * length;
        out[2] = az * length;
        return out;
}
Vector3 .prototype. dot = function dot(a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
Vector3 .prototype. wellFormed = function wellFormed(a) {
            let ax = a[0],
          ay = a[1],
          az = a[2];
        return (Number.isFinite(ax) && !Number.isNaN(ax)) && (Number.isFinite(ay) && !Number.isNaN(ay)) && (Number.isFinite(az) && !Number.isNaN(az));
}
Vector3 .prototype. squaredLength = function squaredLength(a) {
            let ax = a[0],
          ay = a[1],
          az = a[2];
        return ax * ax + ay * ay + az * az;
}
Vector3 .prototype. len = function len(a) {
            let ax = a[0],
          ay = a[1],
          az = a[2];
        return sqrt(ax * ax + ay * ay + az * az);
}
Vector3 .prototype. squaredDistance = function squaredDistance(a, b) {
            let x = b[0] - a[0],
          y = b[1] - a[1],
          z = b[2] - a[2];
        return x * x + y * y + z * z;
}
Vector3 .prototype. dist = function dist(a, b) {
            let x = b[0] - a[0],
          y = b[1] - a[1],
          z = b[2] - a[2];
        return sqrt(x * x + y * y + z * z);
}
Vector3 .prototype. sum = function sum(a) {
            return a[0] + a[1] + a[2];
}
Vector3.fromValues = Vector3.prototype.fromSource
for (var property in Vector3 .prototype)
  Vector3[property] = Vector3.prototype[property]
