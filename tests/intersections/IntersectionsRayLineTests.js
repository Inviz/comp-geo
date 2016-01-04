import assert from 'assert';
import Ray from '../../es6/primitives/Ray';
import Line from '../../es6/primitives/Line';
import intersect from '../../es6/intersections/Intersections';
import {assertRoughlyEqual, assertRoughlyEqualVec2} from 'missing-stuff';

function drawIntersections(a, b, i) {
	return [a, b].concat(i);
}

var tests = [
	{
		name: "ray-line intersection",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0, 0], [1, 1]);
			var b = new Line([0, 1], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			var i0 = i[0];
			assertRoughlyEqualVec2(i0.p, [1, 1], "p");
		}
	},
	{
		name: "ray-line no intersection",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0.5, 1], [-1, 0]);
			var b = new Line([0.5, 0.5], [1, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	},
];

Object.defineProperties(exports, {
	name: {value: "intersections ray-line tests"},
	tests: {value: tests}
});
