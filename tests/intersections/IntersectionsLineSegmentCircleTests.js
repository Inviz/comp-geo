import assert from 'assert';
import LineSegment from '../../es6/primitives/LineSegment';
import Circle from '../../es6/primitives/Circle';
import intersect from '../../es6/intersections/Intersections';
import {assertRoughlyEqual, assertRoughlyEqualVec2} from '../../es6/missing-stuff';

function drawIntersections(a, b, i) {
	return [a, b].concat(i);
}

var tests = [
	{
		name: "lineSegment-circle intersection",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0.5, 0], [0.5, 1]);
			var b = new Circle([0.5, 0.5], 0.25);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);

			assertRoughlyEqualVec2(i[0].p, [0.5, 0.75], "p0");
			assertRoughlyEqual(i[0].u, 0.75, "u0");
			assertRoughlyEqual(i[0].v, 0.25, "v0");

			assertRoughlyEqualVec2(i[1].p, [0.5, 0.25], "p1");
			assertRoughlyEqual(i[1].u, 0.25, "u1");
			assertRoughlyEqual(i[1].v, 0.75, "v1");
		}
	},
	{
		name: "lineSegment-circle tip",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0.5, 0], [0.5, 1]);
			var b = new Circle([0.5, 0.5], 0.5);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			assertRoughlyEqualVec2(i[0].p, [0.5, 1], "p0");
			assertRoughlyEqual(i[0].u, 1, "u0");
			assertRoughlyEqualVec2(i[1].p, [0.5, 0], "p1");
			assertRoughlyEqual(i[1].u, 0, "u1");
		}
	},
	{
		name: "lineSegment-circle inside",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0.5, 0.25], [0.5, 0.75]);
			var b = new Circle([0.5, 0.5], 0.5);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	},
	{
		name: "lineSegment-circle outside",
		draw: drawIntersections,
		setup: function() {
			var a = new LineSegment([0.1, 0], [0.1, 1]);
			var b = new Circle([0.5, 0.5], 0.25);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	}
];

Object.defineProperties(exports, {
	name: {value: "intersections lineSegment-circle tests"},
	tests: {value: tests}
});
