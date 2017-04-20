import { Vector2 } from '../nd-linalg';

const Mathmin = Math.min,
	Mathmax = Math.max,
	Mathabs = Math.abs;

const ROUGHLY_EPSILON = 1e-4;

module.exports = {
	// Ranges and Numbers
	clamp: function (min, number, max) {
		return Mathmin(Mathmax(number, min), max);
	},

	between: function (min, number, max) {
		return min <= number && number <= max;
	},

	withinRange: function (target, number, range) {
		$Number.between(target - range, number, target + range);
	},

	betweenModulo: function (start, number, end, period) {
		var numberModulo = (number % period + period) % period;
		var startModulo = (start % period + period) % period;
		var endModulo = (end % period + period) % period;
		if (start <= end) return numberModulo.between(startModulo, end === period ? period : endModulo);
		else return numberModulo > startModulo || numberModulo < endModulo;
	},

	roughlyEqual: function (number, other, epsilon) {
		return Mathabs(number - other) <= (epsilon || ROUGHLY_EPSILON);
	},

	roughlyEqualVec2: function( a, b, epsilon ){
		return ( Math.abs(a[0] - b[0]) <= ( epsilon || ROUGHLY_EPSILON) )
			&& ( Math.abs(a[1] - b[1]) <= ( epsilon || ROUGHLY_EPSILON) );
	},

	assertRoughlyEqual: function (number, other, epsilon ) {
		return assert( Mathabs(number - other) <= ( epsilon || ROUGHLY_EPSILON) );
	},

	assertRoughlyEqualVec2: function (vec, other, epsilon ) {
		return assert( ( Math.abs(vec[0] - other[0]) <= ( epsilon || ROUGHLY_EPSILON) )
			&& ( Math.abs(vec[1] - other[1]) <= ( epsilon || ROUGHLY_EPSILON) ) );
	},

	roughlyBetween: function (min, number, max, epsilon) {
		return (min < number || isRoughly( min, number, epsilon))
			&& (number < max || isRoughly( max, number, epsilon));
	},
	assert: function(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
	},
	mapPush: function( map, key, value ){
		return map.set( key, value );
	},

	ROUGHLY_EPSILON
};

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function isRoughly( a, b, epsilon ){
	return Math.abs( a-b ) <= ( epsilon || ROUGHLY_EPSILON );
}