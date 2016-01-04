import assert from 'assert';
import LineSegment from '../../es6/primitives/LineSegment';
import {assertRoughlyEqualVec2} from 'missing-stuff';

Object.defineProperties(exports, {
	name: {value: "line tests"},
	tests: {value: [
		{
			name: "line subdivide",
			setup: function() {
				var line = new LineSegment([0, 0], [1, 1]);
				return line.subdivide([0.25, 0.25]).concat([[0.25, 0.25]]);
			},
			assert: function(a, b, c, d) {
				assert(d === undefined);
				assertRoughlyEqualVec2(a.start, [0, 0]);
				assertRoughlyEqualVec2(a.end, [0.25, 0.25]);
				assertRoughlyEqualVec2(b.start, [0.25, 0.25]);
				assertRoughlyEqualVec2(b.end, [1, 1]);
			}
		}
	]}
});
