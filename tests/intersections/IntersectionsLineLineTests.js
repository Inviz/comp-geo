import assert from 'assert';
import Line from '../../es6/primitives/Line';
import intersect from '../../es6/intersections/Intersections';
import {assertRoughlyEqual, assertRoughlyEqualVec2} from 'missing-stuff';

function drawIntersections(a, b, i) {
	return [a, b].concat(i);
}

var tests = [
	{
		name: "line-line intersection",
		draw: drawIntersections,
		setup: function() {
			var a = new Line([0.5, 0.5], [-1, -1]);
			var b = new Line([0.5, 1], [-1, 0]);
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
		name: "line-line intersection 2",
		draw: drawIntersections,
		setup: function() {
			var a = new Line([0, 0], [1, 1]);
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
		name: "line-line intersection 3",
		draw: drawIntersections,
		setup: function() {
			var a = new Line([0.33, 0], [-0.1, 1]);
			var b = new Line([0.66, 1], [-0.1, -1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
		}
	},
	{
		name: "line-line parallel",
		draw: drawIntersections,
		setup: function() {
			var a = new Line([0, 0.1], [1, 0]);
			var b = new Line([0, 0.9], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	},
	{
		name: "line-line contained",
		draw: drawIntersections,
		setup: function() {
			var a = new Line([0, 0.5], [1, 0]);
			var b = new Line([0.5, 0.5], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.5]);
		}
	}
];

Object.defineProperties(exports, {
	name: {value: "intersections line-line tests"},
	tests: {value: tests}
});
