import Shape from './Shape';
const attachedRight = Symbol("attachedRight");

export {attachedRight};

export default class Stroke {
	constructor (path, attachment, width) {
		if (attachment !== attachedRight) throw "Not yet implemented";

		this.leftEdge = path;
		this.rightEdge = path.offsetPerpendicular(width).simplifySelfIntersections();

		let capIntersections = intersect(
			new LineSegment(this.leftEdge.start, this.rightEdge.start),
			new LineSegment(this.leftEdge.end, this.rightEdge.end));

		// path doesn't have a right edge, caps intersect at a distance closer than width
		if (capIntersections[0]) {
			this.startCap = new LineSegment(this.leftEdge.start, capIntersections[0].p);
			this.endCap = new LineSegment(this.leftEdge.end, capIntersections[0].p);
			this.rightEdge = undefined;
			return;
		}

		// loop artifact at end
		let distanceBetweenEnds = vec2.dist(this.leftEdge.closestPointTo(this.rightEdge.end), this.rightEdge.end);
		if (distanceBetweenEnds < width - Number.ROUGHLY_EPSILON) {
			let shortenedRightEdge = new Path(this.rightEdge.segments.slice(0, -1));
			let newOuterEndOffset = shortenedRightEdge.offsetOf(this.rightEdge.end);
			this.rightEdge = this.rightEdge.cut(0, newOuterEndOffset);
		}

		// loop artifact at beginning
		let distanceBetweenStarts = vec2.dist(this.leftEdge.closestPointTo(this.rightEdge.start), this.rightEdge.start);
		if (distanceBetweenStarts < width - Number.ROUGHLY_EPSILON) {
			let shortenedRightEdge = new Path(this.rightEdge.segments.slice(1));
			let newOuterStartOffset = shortenedRightEdge.offsetOf(this.rightEdge.start);
			newOuterStartOffset += shortenedRightEdge.segments[0].length
			this.rightEdge = this.rightEdge.cut(newOuterStartOffset, this.rightEdge.length);
		}

		this.startCap = new Path([new LineSegment(this.leftEdge.start, this.rightEdge.start)]);
		this.endCap = new Path([new LineSegment(this.leftEdge.end, this.rightEdge.end)]);
	}

	get shape () {
		return new Shape(this.leftEdge.concat(this.endCap)
				.concat(this.rightEdge.reverse()).concat(this.startCap.reverse()));
	}
}