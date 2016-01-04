import {Vector2 as vec2} from 'nd-linalg';

export default Rectangle;

export {
	newRectangleCorner as corner,
	newRectangleExtent as extent,
	newRectanglePoint as point,
	newRectangleMinMax as minmax,
	newRectangleZero as zero
};

function Rectangle(top, right, bottom, left) {
	this.top = top;
	this.bottom = bottom;
	this.left = left;
	this.right = right;
}

function newRectangleCorner(origin, corner) {
	return new Rectangle(origin[1], corner[0], corner[1], origin[0]);
}

function newRectangleExtent(origin, extent) {
	return new Rectangle(
		origin[1],
		origin[0] + extent[0],
		origin[1] + extent[1],
		origin[0]);
}

function newRectanglePoint(position) {
	return newRectangleCorner(position, position);
}

function newRectangleMinMax() {
	return new Rectangle(Infinity, -Infinity, -Infinity, Infinity);
}

function newRectangleZero() {
	return new Rectangle(0, 0, 0, 0);
}

Object.defineProperties(Rectangle.prototype, {
	"name": 			{value: "Rectangle"},
	"width": 			{enumerable: true, get: getWidth, set: setWidth},
	"height": 			{enumerable: true, get: getHeight, set: setHeight},
	"center": 			{get: center},
	"origin": 			{get: getOrigin, set: setOrigin},
	"extent": 			{get: getExtent, set: setExtent},
	"corner": 			{get: getCorner, set: setCorner},
	"boundingBox": 		{get: boundingBox},

	"containsPoint": 	{value: containsPoint},
	"scale": 			{value: scale},
	"translate": 		{value: translate},
	"expand": 			{value: expand},

	"draw": 			{value: draw}
});

function getWidth() {
	return this.right - this.left;
}

function setWidth(value) {
	this.right = this.left + value;
}

function getHeight() {
	return this.bottom - this.top;
}

function setHeight(value) {
	this.bottom = this.top + value;
}

function center() {
	var center = vec2(0, 0);
	vec2.lerp(center, this.origin, this.corner, 0.5);
	return center;
}

function getOrigin() {
	return vec2.fromValues(this.left, this.top);
}

function setOrigin(v) {
	this.left = v[0];
	this.top = v[1];
}

function getExtent() {
	return vec2.fromValues(this.width, this.height);
}

function setExtent(v) {
	this.width = v[0];
	this.height = v[1];
}

function getCorner() {
	return vec2.fromValues(this.right, this.bottom);
}

function setCorner(v) {
	this.right = v[0];
	this.bottom = v[1];
}

function boundingBox() {
	return this;
}

function containsPoint(p) {
	return this.left <= p[0] && p[0] < this.right && this.top <= p[1] && p[1] < this.bottom;
}

function scale(scalar) {
	return new Rectangle(
		this.top * scalar,
		this.right * scalar,
		this.bottom * scalar,
		this.left * scalar);
}

function translate(offset) {
	return new Rectangle(
		this.top + offset[1],
		this.right + offset[0],
		this.bottom + offset[1],
		this.left + offset[0]);
}

function expand(rectangle) {
	return new Rectangle(
		Math.min(this.top, rectangle.top),
		Math.max(this.right, rectangle.right),
		Math.max(this.bottom, rectangle.bottom),
		Math.min(this.left, rectangle.left));
}

function draw(context) {
	context.stroke(this);
}
