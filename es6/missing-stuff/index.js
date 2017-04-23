import Vector2 from '../nd-linalg/Vector2';

const Mathmin = Math.min,
	Mathmax = Math.max,
	Mathabs = Math.abs;

export const ROUGHLY_EPSILON = 1e-4;

export function clamp(min, number, max) {
	return Mathmin(Mathmax(number, min), max);
}

export function between(min, number, max) {
	return min <= number && number <= max;
}

export function withinRange(target, number, range) {
	$Number.between(target - range, number, target + range);
}

export function betweenModulo(start, number, end, period) {
	var numberModulo = (number % period + period) % period;
	var startModulo = (start % period + period) % period;
	var endModulo = (end % period + period) % period;
	if (start <= end) return numberModulo.between(startModulo, end === period ? period : endModulo);
	else return numberModulo > startModulo || numberModulo < endModulo;
}

export function roughlyEqual(number, other, epsilon) {
	return Mathabs(number - other) <= (epsilon || ROUGHLY_EPSILON);
}

export function roughlyEqualVec2( a, b, epsilon ){
	return ( Math.abs(a[0] - b[0]) <= ( epsilon || ROUGHLY_EPSILON) )
		&& ( Math.abs(a[1] - b[1]) <= ( epsilon || ROUGHLY_EPSILON) );
}

export function assertRoughlyEqual(number, other, epsilon ) {
	return assert( Mathabs(number - other) <= ( epsilon || ROUGHLY_EPSILON) );
}

export function assertRoughlyEqualVec2(vec, other, epsilon ) {
	return assert( ( Math.abs(vec[0] - other[0]) <= ( epsilon || ROUGHLY_EPSILON) )
		&& ( Math.abs(vec[1] - other[1]) <= ( epsilon || ROUGHLY_EPSILON) ) );
}

export function roughlyBetween(min, number, max, epsilon) {
	return (min < number || isRoughly( min, number, epsilon))
		&& (number < max || isRoughly( max, number, epsilon));
}

export function assert(condition, message) {
  if (!condition) {
      throw message || "Assertion failed";
  }
}

export function mapPush( map, key, value ){
	return map.set( key, value );
}

function assert(condition, message) {
  if (!condition) {
    throw message || "Assertion failed";
  }
}

function isRoughly( a, b, epsilon ){
	return Math.abs( a-b ) <= ( epsilon || ROUGHLY_EPSILON );
}