import Curve from '../../es6/primitives/Curve';
import LineSegment from '../../es6/primitives/LineSegment';
import intersect from '../../es6/intersections/Intersections';
import assert from 'assert';
import {assertRoughlyEqual, assertRoughlyEqualVec2} from '../../es6/missing-stuff';

Object.defineProperties(exports, {
	name: {value: "curve tests"},
	tests: {value: [
		{
			name: "curve circles",
			setup: function() {
				var a = new Curve([0, 0], [0, 1], [2, 0]);
				var b = new Curve([1, 0], [0, 1], [3, 0]);
				return [a, b];
			},
			assert: function(a, b) {
				assertRoughlyEqualVec2(a.center, [1, 0]);
				assertRoughlyEqual(a.radius, 1);

				assertRoughlyEqualVec2(b.center, [2, 0]);
				assertRoughlyEqual(b.radius, 1);
			}
		},
		{
			name: "curve degenerate flat circle to line",
			setup: function() {
				var c = new Curve([0, 0], [0, 1], [0, 1]);
				return [c];
			},
			assert: function(c) {
				assert(c.type() == intersect.LineSegmentTypeFunction());
				assertRoughlyEqualVec2(c.start, [0, 0]);
				assertRoughlyEqualVec2(c.end, [0, 1]);
			}
		},
		{
			name: "curve degenerate infinite circle exception",
			setup: function() {},
			assert: function() {
				assert.throws(
					function() {
						new Curve([0, 0], [0, -1], [0, 1]);
					},
					"Not a valid curve, infinite circle found");
			}
		},
		{
			name: "curve subdivide",
			setup: function() {
				var curve = new Curve([0, 0], [0, 1], [1, 1]);
				var line = new LineSegment([0, 1], [1, 0]);
				var i = intersect(line, curve);
				return curve.subdivide(i[0].p).concat([i[0].p]);
			},
			assert: function(a, b, middle, nothing) {
				assert(nothing === undefined);
				assertRoughlyEqualVec2(a.start, [0, 0]);
				assertRoughlyEqualVec2(a.end, middle);
				assertRoughlyEqualVec2(b.start, middle);
				assertRoughlyEqualVec2(b.end, [1, 1]);
			}
		}
	]}
});
