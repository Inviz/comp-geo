import Circle from '../../es6/primitives/Circle';
import {assertRoughlyEqual} from 'missing-stuff';

Object.defineProperties(exports, {
	name: {value: "circle tests"},
	tests: {value: [
		{
			name: "circle angles",
			setup: function() {
				return [new Circle([0, 0], 1)];
			},
			assert: function(c) {
				assertRoughlyEqual(c.angle([0, 1]), 0.25);
				assertRoughlyEqual(c.angle([-1, 0]), 0.5);
				assertRoughlyEqual(c.angle([0, -1]), 0.75);
				assertRoughlyEqual(c.angle([1, 0]), 0);
			}
		}
	]}
});
