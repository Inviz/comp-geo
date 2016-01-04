import assert from 'assert';
import Circle from '../../es6/primitives/Circle';
import intersect from '../../es6/intersections/Intersections';
import {assertRoughlyEqual, assertRoughlyEqualVec2} from 'missing-stuff';

function drawIntersections(a, b, i) {
	return [a, b].concat(i);
}

var tests = [
	{
		name: "circle-circle intersection",
		draw: drawIntersections,
		setup: function() {
			var a = new Circle([0.25, 0.5], 0.25);
			var b = new Circle([0.5, 0.5], 0.25);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 2);
			var i0 = i[0];
			var i1 = i[1];

			assertRoughlyEqualVec2(i0.p, [0.375, 1 - 0.28349363803863525], "p0");
			assertRoughlyEqualVec2(i1.p, [0.375, 0.28349363803863525], "p1");
			assertRoughlyEqual(i0.u, 0.16666667017293113, "u0");
			assertRoughlyEqual(i0.v, 0.3333333298270689, "v0");
			assertRoughlyEqual(i1.u, 0.8333333298270689, "u1");
			assertRoughlyEqual(i1.v, 0.6666666701729311, "v1");
		}
	},
	{
		name: "circle-circle tip",
		draw: drawIntersections,
		setup: function() {
			var a = new Circle([0.25, 0.5], 0.25);
			var b = new Circle([0.75, 0.5], 0.25);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 1);
			var i0 = i[0];
			assertRoughlyEqualVec2(i0.p, [0.5, 0.5], "p");
			assertRoughlyEqual(i0.u, 0, "u");
			assertRoughlyEqual(i0.v, 0.5, "v");
		}
	},
	{
		name: "circle-circle inside-outside",
		draw: drawIntersections,
		setup: function() {
			var a = new Circle([0.5, 0.5], 0.5);
			var b = new Circle([0.5, 0.5], 0.25);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	},
	{
		name: "circle-circle same",
		draw: drawIntersections,
		setup: function() {
			var a = new Circle([0.5, 0.5], 0.5);
			var b = new Circle([0.5, 0.5], 0.5);
			var i = intersect(a, b);
			return [a, b, i];
		},
		assert: function(a, b, i) {
			assert.equal(i.length, 0);
		}
	}
];

Object.defineProperties(exports, {
	name: {value: "intersections circle-circle tests"},
	tests: {value: tests}
});
