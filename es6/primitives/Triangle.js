import { roughlyEqual } from '../missing-stuff';

export default class Triangle {
	constructor(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	get isColinear() { return colinear(this.a, this.b, this.c); }
	get center() { return center(this.a, this.b, this.c); }
}

export function colinear(a, b, c) {
	const m = (c[0] - a[0]) * (b[1] - a[1]);
	const n = ((b[0] - a[0]) * (c[1] - a[1]));
	return roughlyEqual( n, m );
}

export function center(a, b, c) {
	return [(a[0] + b[0] + c[0]) / 3,
			(a[1] + b[1] + c[1]) / 3];
}
