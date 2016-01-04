import assert from 'assert';
import LineSegment from '../../es6/primitives/LineSegment';
import intersect from '../../es6/intersections/Intersections';
import {assertRoughlyEqual, assertRoughlyEqualVec2} from 'missing-stuff';

function drawIntersections(a, b, i) {
	return [a, b].concat(i);
}

var tests = [
	{
		name: "lineSegment-lineSegment intersection",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0, 0], [1, 1]);
			var b = new LineSegment([0, 1], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			var i0 = i[0];
			assertRoughlyEqualVec2(i0.p, [0.5, 0.5], "p");
			assertRoughlyEqual(i0.u, 0.5, "v");
			assertRoughlyEqual(i0.v, 0.5, "u");
		}
	},
	{
		name: "lineSegment-lineSegment no-intersection",
		draw: drawIntersections,
		setup: function() {
		 	var a = new LineSegment([0, 0], [-1, -1]);
			var b = new LineSegment([0, 1], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	},
	{
		name: "lineSegment-lineSegment same",
		draw: drawIntersections,
		setup: function() {
	 		var a = new LineSegment([0, 0], [1, 1]);
	 		var b = a;
	 		var i = intersect(a, b);
	 		return [a, b, i];
	 	},
	 	assert: function(a, b, i) {
	 		assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0, 0]);
			assertRoughlyEqualVec2(i[1].p, [1, 1]);
			assertRoughlyEqual(i[0].u, 0);
			assertRoughlyEqual(i[0].v, 0);
			assertRoughlyEqual(i[1].u, 1);
			assertRoughlyEqual(i[1].v, 1);
	 	}
	},
	{
		name: "lineSegment-lineSegment parallel",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0, 0], [0, 1]);
			var b = new LineSegment([1, 0], [1, 1]);
	 		var i = intersect(a, b);
	 		return [a, b, i];
	 	},
	 	assert: function(a, b, i) {
	 		assert.equal(i.length, 0);
	 	}
	},
	{
		name: "lineSegment-lineSegment overlap",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0, 0.5], [0.75, 0.5]),
				b = new LineSegment([0.25, 0.5], [1, 0.5]),
				i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0.25, 0.5]);
			assertRoughlyEqualVec2(i[1].p, [0.75, 0.5]);
			assertRoughlyEqual(i[0].u, 0.3333333333333333);
			assertRoughlyEqual(i[0].v, 0);
			assertRoughlyEqual(i[1].u, 1);
			assertRoughlyEqual(i[1].v, 0.6666666666666666);
		}
	},
	{
		name: "lineSegment-lineSegment contained touching start tip",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0, 0.5], [1, 0.5]),
				b = new LineSegment([0, 0.5], [0.5, 0.5]),
				i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0.0, 0.5]);
			assertRoughlyEqualVec2(i[1].p, [0.5, 0.5]);
			assertRoughlyEqual(i[0].u, 0);
			assertRoughlyEqual(i[0].v, 0);
			assertRoughlyEqual(i[1].u, 0.5);
			assertRoughlyEqual(i[1].v, 1);
		}
	},
	{
		name: "lineSegment-lineSegment contained touching end tip",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0, 0.5], [1, 0.5]),
				b = new LineSegment([0.5, 0.5], [1, 0.5]),
				i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.5]);
			assertRoughlyEqualVec2(i[1].p, [1, 0.5]);
			assertRoughlyEqual(i[0].u, 0.5);
			assertRoughlyEqual(i[0].v, 0);
			assertRoughlyEqual(i[1].u, 1);
			assertRoughlyEqual(i[1].v, 1);
		}
	},
	{
		name: "lineSegment-lineSegment contained",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0, 0.5], [1, 0.5]),
				b = new LineSegment([0.25, 0.5], [0.75, 0.5]),
				i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0.25, 0.5]);
			assertRoughlyEqualVec2(i[1].p, [0.75, 0.5]);
			assertRoughlyEqual(i[0].u, 0.25);
			assertRoughlyEqual(i[0].v, 0);
			assertRoughlyEqual(i[1].u, 0.75);
			assertRoughlyEqual(i[1].v, 1);
		}
	},
	{
		name: "lineSegment-lineSegment tip start to end",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0, 0], [1, 1]);
			var b = new LineSegment([1, 1], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			var i0 = i[0];
			assertRoughlyEqualVec2(i0.p, [1, 1], "p");
			assertRoughlyEqual(i0.u, 1, "u");
			assertRoughlyEqual(i0.v, 0, "v");
		}
	},
	{
		name: "lineSegment-lineSegment tip end to end",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0, 0], [0.5, 0.5]);
			var b = new LineSegment([1, 1], [0.5, 0.5]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			var i0 = i[0];
			assertRoughlyEqualVec2(i0.p, [0.5, 0.5], "p");
			assertRoughlyEqual(i0.u, 1, "u");
			assertRoughlyEqual(i0.v, 1, "v");
		}
	},
	{
		name: "lineSegment-lineSegment tip start to start",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0.5, 0.5], [0, 0]);
			var b = new LineSegment([0.5, 0.5], [1, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			var i0 = i[0];
			assertRoughlyEqualVec2(i0.p, [0.5, 0.5], "p");
			assertRoughlyEqual(i0.u, 0, "u");
			assertRoughlyEqual(i0.v, 0, "v");
		}
	}
];

Object.defineProperties(exports, {
	name: {value: "intersections lineSegment-lineSegment tests"},
	tests: {value: tests}
});
