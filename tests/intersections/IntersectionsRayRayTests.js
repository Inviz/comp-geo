import assert from 'assert';
import Ray from '../../es6/primitives/Ray';
import intersect from '../../es6/intersections/Intersections';
import {assertRoughlyEqual, assertRoughlyEqualVec2} from '../../es6/missing-stuff';

function drawIntersections(a, b, i) {
	return [a, b].concat(i);
}

var tests = [
	{
		name: "ray-ray intersection",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0, 0], [1, 1]);
			var b = new Ray([0, 1], [1, 0]);
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
		name: "ray-ray tip",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0, 0], [0, 1]);
			var b = new Ray([0, 0], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			assertRoughlyEqualVec2(i[0].p, [0, 0], "p");
			assertRoughlyEqual(i[0].u, 0, "u");
			assertRoughlyEqual(i[0].v, 0, "v");
		}
	},
	{
		name: "ray-ray parallel",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0, 0.1], [1, 0]);
			var b = new Ray([0, 0.9], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	},
	{
		name: "ray-ray contained",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0, 0.5], [1, 0]);
			var b = new Ray([0.5, 0.5], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.5]);
		}
	},
	{
		name: "ray-ray contained variant",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0.5, 0.5], [1, 0]);
			var b = new Ray([0, 0.5], [1, 0]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			assertRoughlyEqualVec2(i[0].p, [0.5, 0.5]);
		}
	},
	{
		name: "ray-ray no intersection",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0.33, 0], [-0.1, 1]);
			var b = new Ray([0.66, 1], [-0.1, -1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	},
	{
		name: "ray-ray intersection up",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0.33, 1], [0.1, -1]);
			var b = new Ray([0.66, 1], [-0.1, -1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
		}
	},
	{
		name: "ray-ray intersection down",
		draw: drawIntersections,
		setup: function() {
			var a = new Ray([0.33, 0], [0.1, 1]);
			var b = new Ray([0.66, 0], [-0.1, 1]);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
		}
	}
];

Object.defineProperties(exports, {
	name: {value: "intersections ray-ray tests"},
	tests: {value: tests}
});
