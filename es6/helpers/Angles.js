import {Vector2 as vec2} from 'nd-linalg';

export {theta, angleFrom};

function theta(v) {
	var angle = Math.atan2(v[1], v[0]);
	return (angle < 0 ? angle + (2 * Math.PI) : angle) / (2 * Math.PI);
}

function angleFrom(p, center) {
	return theta(vec2.sub(vec2(0, 0), p, center));
}