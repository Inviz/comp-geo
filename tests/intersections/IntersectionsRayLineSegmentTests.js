import assert from 'assert';
import Ray from '../../es6/primitives/Ray';
import LineSegment from '../../es6/primitives/LineSegment';
import intersect from '../../es6/intersections/Intersections';
import {assertRoughlyEqual, assertRoughlyEqualVec2} from 'missing-stuff';

function drawIntersections(a, b, i) {
	return [a, b].concat(i);
}

var tests = [
	{
		name: "ray-lineSegment intersection",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0, 0.5], [1, 0]);
			var b = new LineSegment([1, 0.25], [1, 0.75]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			var i0 = i[0];
			assertRoughlyEqualVec2(i0.p, [1, 0.5], "p");
		}
	},
	{
		name: "ray-lineSegment no intersection up",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0, 0.5], [1, 0]);
			var b = new LineSegment([1, 0.75], [1, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	},
	{
		name: "ray-lineSegment no intersection down",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0, 0.5], [1, 0]);
			var b = new LineSegment([1, 0], [1, 0.25]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	}
];

Object.defineProperties(exports, {
	name: {value: "intersections ray-lineSegment tests"},
	tests: {value: tests}
});
