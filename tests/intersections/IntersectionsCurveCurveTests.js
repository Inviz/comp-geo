import assert from 'assert';
import Curve from '../../es6/primitives/Curve';
import intersect from '../../es6/intersections/Intersections';
import {assertRoughlyEqual, assertRoughlyEqualVec2} from '../../es6/missing-stuff';
import {Vector2 as vec2} from '../../es6/nd-linalg';

function drawIntersections(a, b, i) {
	return [a, b].concat(i);
}

var tests = [
	{
		name: "curve-curve intersection1",
		draw: drawIntersections,
	 	setup: function() {
	 		var a = new Curve([0, 0], [0, 1], [1, 1]);
			var b = new Curve([1, 0], [0, 1], [0, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.8660253882408142]);
		}
	},
	{
		name: "curve-curve intersection2",
		draw: drawIntersections,
		setup: function() {
	 		var a = new Curve([0.25, 0], [1, 0], [0.25, 1]);
			var b = new Curve([0.75, 0], [-1, 0], [0.75, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0.5, 1 - 0.0669872984290123], "p0");
			assertRoughlyEqualVec2(i[1].p, [0.5, 0.0669872984290123], "p1");
		}
	},
	{
		name: "curve-curve tip1",
		draw: drawIntersections,
		setup: function() {
	 		var a = new Curve([0, 0], [1, 0], [0, 1]);
			var b = new Curve([1, 0], [-1, 0], [1, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.5], "p");
		}
	},
	{
		name: "curve-curve tip1 variant1",
		draw: drawIntersections,
		setup: function() {
	 		var a = new Curve([0, 0], [1, 0], [0.5, 0.5]);
			var b = new Curve([0.5, 0.5], [0, 1], [1, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.5], "p");
		}
	},
	{
		name: "curve-curve tip1 variant2",
		draw: drawIntersections,
		setup: function() {
	 		var a = new Curve([0, 0], [1, 0], [0.5, 0.5]);
			var b = new Curve([0.5, 0.5], [1, 0], [1, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.5], "p");
		}
	},
	{
		name: "curve-curve tip2",
		draw: drawIntersections,
		setup: function() {
	 		var a = new Curve([0, 0], [0, 1], [1, 0]);
			var b = new Curve([0, 0], [0.5, 0.5], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [1, 0], "p0");
			assertRoughlyEqualVec2(i[1].p, [0, 0], "p1");
			assertRoughlyEqual(i[0].u, 1, "u0");
			assertRoughlyEqual(i[0].v, 1, "v0");
			assertRoughlyEqual(i[1].u, 0, "u1");
			assertRoughlyEqual(i[1].v, 0, "v1");
		}
	},
	{
		name: "curve-curve tip2 variant",
		draw: drawIntersections,
		setup: function() {
	 		var a = new Curve([0, 0.5], [0, 1], [1, 0.5]);
			var b = new Curve([0, 0.5], [0, -1], [1, 0.5]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0, 0.5], "p0");
			assertRoughlyEqualVec2(i[1].p, [1, 0.5], "p1");
			assertRoughlyEqual(i[0].u, 0, "u0");
			assertRoughlyEqual(i[0].v, 0, "v0");
			assertRoughlyEqual(i[1].u, 1, "u1");
			assertRoughlyEqual(i[1].v, 1, "v1");
		}
	},
	{
		name: "curve-curve tip end to end",
		draw: drawIntersections,
		setup: function() {
	 		var a = new Curve([0, 0], [1, 0], [0, 1]);
			var b = new Curve([0.5, 0.5], [0, 1], [0, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.5], "p0");
			assertRoughlyEqualVec2(i[1].p, [0, 1], "p1");
			assertRoughlyEqual(i[0].u, a.getAlphaValueAtPosition([0.5, 0.5]), "u0");
			assertRoughlyEqual(i[0].v, 0, "v0");
			assertRoughlyEqual(i[1].u, 1, "u1");
			assertRoughlyEqual(i[1].v, 1, "v1");
		}
	},
	{
		name: "curve-curve tip start to start",
		draw: drawIntersections,
		setup: function() {
	 		var a = new Curve([0, 0], [1, 0], [0, 1]);
			var b = new Curve([0, 0], [1, 0], [0.5, 0.5]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0, 0], "p0");
			assertRoughlyEqualVec2(i[1].p, [0.5, 0.5], "p1");
			assertRoughlyEqual(i[0].u, 0, "u0");
			assertRoughlyEqual(i[0].v, 0, "v0");
			assertRoughlyEqual(i[1].u, a.getAlphaValueAtPosition([0.5, 0.5]), "u1");
			assertRoughlyEqual(i[1].v, 1, "v1");
		}
	},
	{
		name: "curve-curve contained",
		draw: drawIntersections,
		setup: function() {
	 		var a = new Curve([0, 0], [1, 0], [0, 1]);
	 		var start = [0.5, -0.5];
	 		vec2.normalize(start, start);
	 		vec2.scale(start, start, 0.5);
	 		start[1] += 0.5;
	 		var end = [0.5, 0.5];
	 		vec2.normalize(end, end);
	 		vec2.scale(end, end, 0.5);
	 		end[1] += 0.5;
			var b = new Curve(start, [0.5, 0.5], end);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, b.start, "p0");
			assertRoughlyEqualVec2(i[1].p, b.end, "p1");
			assertRoughlyEqual(i[0].u, a.getAlphaValueAtPosition(b.start), "u0");
			assertRoughlyEqual(i[0].v, 0, "v0");
			assertRoughlyEqual(i[1].u, a.getAlphaValueAtPosition(b.end), "u1");
			assertRoughlyEqual(i[1].v, 1, "v1");
		}
	},
	{
		name: "curve-curve overlap",
		draw: drawIntersections,
		setup: function() {
	 		var start = [0.5, -0.5];
	 		vec2.normalize(start, start);
	 		vec2.scale(start, start, 0.5);
	 		start[1] += 0.5;
	 		var end = [0.5, 0.5];
	 		vec2.normalize(end, end);
	 		vec2.scale(end, end, 0.5);
	 		end[1] += 0.5;
	 		var a = new Curve([0, 0], [1, 0], end);
			var b = new Curve(start, [0.5, 0.5], [0, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, b.start, "p0");
			assertRoughlyEqualVec2(i[1].p, a.end, "p1");
			assertRoughlyEqual(i[0].u, a.getAlphaValueAtPosition(b.start), "u0");
			assertRoughlyEqual(i[0].v, 0, "v0");
			assertRoughlyEqual(i[1].u, 1, "u1");
			assertRoughlyEqual(i[1].v, b.getAlphaValueAtPosition(a.end), "v1");
		}
	}
];

Object.defineProperties(exports, {
	name: {value: "intersections curve-curve tests"},
	tests: {value: tests}
});
