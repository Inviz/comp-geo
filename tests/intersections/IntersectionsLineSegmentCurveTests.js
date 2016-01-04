import assert from 'assert';
import LineSegment from '../../es6/primitives/LineSegment';
import Curve from '../../es6/primitives/Curve';
import intersect from '../../es6/intersections/Intersections';
import {assertRoughlyEqual, assertRoughlyEqualVec2} from 'missing-stuff';

function drawIntersections(a, b, i) {
	return [a, b].concat(i);
}

var tests = [
	{
		name: "lineSegment-curve intersection1",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0, 0.5], [0.5, 0.5]);
			var b = new Curve([0.5, 0.25], [-1, 0], [0.5, 0.75]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			assertRoughlyEqualVec2(i[0].p, [0.25, 0.5], "p0");
			assertRoughlyEqual(i[0].u, 0.5, "u0");
		}
	},
	{
		name: "lineSegment-curve intersection2",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0.5, 0], [0.5, 1]);
			var b = new Curve([0.5, 0.25], [-1, 0], [0.5, 0.75]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.75], "p0");
			assertRoughlyEqualVec2(i[1].p, [0.5, 0.25], "p1");
			assertRoughlyEqual(i[0].u, 0.75, "u0");
			assertRoughlyEqual(i[0].v, 1, "v0");
			assertRoughlyEqual(i[1].u, 0.25, "u1");
			assertRoughlyEqual(i[1].v, 0, "v1");
		}
	},
		{
		name: "lineSegment-curve tip1",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0.25, 0.5], [0.5, 0.5]);
			var b = new Curve([0.5, 0.25], [-1, 0], [0.5, 0.75]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			assertRoughlyEqualVec2(i[0].p, [0.25, 0.5], "p0");
			assertRoughlyEqual(i[0].u, 0, "u0");
		}
	},
	{
		name: "lineSegment-curve tip2",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0.5, 0.25], [0.5, 0.75]);
			var b = new Curve([0.5, 0.25], [-1, 0], [0.5, 0.75]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.75], "p0");
			assertRoughlyEqualVec2(i[1].p, [0.5, 0.25], "p1");
			assertRoughlyEqual(i[0].u, 1, "u0");
			assertRoughlyEqual(i[1].u, 0, "u1");
		}
	},
	{
		name: "lineSegment-curve miss",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0.5, 0.5], [1, 0.5]);
			var b = new Curve([0.5, 0.25], [-1, 0], [0.5, 0.75]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	}
];

Object.defineProperties(exports, {
	name: {value: "intersections lineSegment-curve tests"},
	tests: {value: tests}
});
