import intersect from '../intersections/Intersections';
import vec2 from '../nd-linalg/Vector2';
import LineSegment from '../primitives/LineSegment';
import Curve from '../primitives/Curve';
import {corner as RectangleCorner} from '../primitives/Rectangle';
import It from '../iteratorers';
import { roughlyEqualVec2 } from '../missing-stuff';

export default class Path {
	constructor (segments, isClockwise, boundingBox) {
		this.segments = segments === undefined ? [] : segments.slice(0);
		this.isClockwise = isClockwise === undefined ? orientation(this.segments) : isClockwise;
		this.boundingBox = boundingBox === undefined ? aabb(this.segments) : boundingBox;

		this.segmentOffsets = new Array(this.segments.length);
		var offset = 0;
		for (var i = 0; i < this.segments.length; i++) {
			this.segmentOffsets[i] = offset;
			offset += this.segments[i].length;
		}
		this.length = offset;
	}

	//static name = "Path";

	// Return true if the path is closed and can be considered a shape
	get isClosed () {
		// console.log('is closed check', this.segments[0].start, this.segments[this.segments.length - 1].end)
		return	this.segments.length > 1
			&&	roughlyEqualVec2(this.segments[0].start, this.segments[this.segments.length - 1].end);
	}

	get isCounterClockwise () {return !this.isClockwise}
	get isContiguous () {
		if (this.segments.length < 2)
			return true;

		for (var i = 0; i < this.segments.length - 1; i++) {
			var a = this.segments[i];
			var b = this.segments[i + 1];
			if (!roughlyEqualVec2(a.end, b.start))
				return false;
		}

		return true;
	}

	get start () {return this.segments[0].start};
	get end () {return this.segments[ this.segments.length-1].end};

	concat (path) {return new Path(this.segments.concat(path.segments));}

	reverse () {
		var segments = new Array(this.segments.length);
		for (var i = 0, j = this.segments.length - 1; i < this.segments.length; i++, j--) {
			segments[j] = this.segments[i].reverse();
		}
		return new Path(segments, !this.isClockwise);
	}

	cut (startOffset, endOffset) {
		//startOffset = startOffset || 0;
		//endOffset = endOffset || this.length;
		var tolerance = 1e-2;

		var firstSegmentToReplace// = this.segments[0];
		var firstSegmentToReplaceIndex// = 0;
		var lastSegmentToReplace// = this.segments[ this.segments.length-1];
		var lastSegmentToReplaceIndex// = this.segments.length - 1;

		for (var s = 0; s < this.segments.length; s++) {
			var segmentOffset = this.segmentOffsets[s];
			if (segmentOffset < startOffset + tolerance){
				firstSegmentToReplaceIndex = s;
				firstSegmentToReplace = this.segments[s];
			}
			if (segmentOffset < endOffset + tolerance) {
				lastSegmentToReplaceIndex = s;
				lastSegmentToReplace = this.segments[s];
			}
		}

		if (firstSegmentToReplace === lastSegmentToReplace) {
			return new Path([new Curve(
				this.positionOf(startOffset/*Math.max(0, startOffset)*/),
				this.directionOf(startOffset/*Math.max(0, startOffset)*/),
				this.positionOf(endOffset/*Math.min(endOffset, this.length)*/)
			)]);
		} else {
			var newSegments = this.segments.slice(firstSegmentToReplaceIndex + 1, lastSegmentToReplaceIndex);

			var newFirstSegment = new Curve(
				this.positionOf(startOffset/*Math.max(0, startOffset)*/),
				this.directionOf(startOffset/*Math.max(0, startOffset)*/),
				firstSegmentToReplace.end
			);

			newSegments.unshift(newFirstSegment);

			var newLastSegment = new Curve(
				lastSegmentToReplace.start,
				lastSegmentToReplace.direction,
				this.positionOf(endOffset/*Math.min(endOffset, this.length)*/)
			);

			newSegments.push(newLastSegment);

			return new Path(newSegments);
		}
	}

	makeContigous (isLoop) {
		var newSegments = [];

		for (let [segmentA, segmentB] of this.segments.values().windows(2)) {
			newSegments.push(segmentA);
			if (!roughlyEqualVec2(segmentA.end, segmentB.start)) {
				newSegments.push(new LineSegment(segmentA.end, /*segmentA.endDirection,*/ segmentB.start));
			}
		}

		newSegments.push(this.segments[ this.segments.length-1]);

		if (isLoop && !roughlyEqualVec2(this.segments[ this.segments.length-1].end, this.segments[0].start)) {
			newSegments.push(new LineSegment(
				this.segments[ this.segments.length-1].end, /*this.segments[ this.segments.length-1].end.endDirection,*/ this.segments[0].start));
		}

		return new Path(newSegments);
	}

	simplifySelfIntersections () {
		var newSegments = [];
		var eps = 1/10;

		var previousIntersectionPosition;

		for (var s = 0; s < this.segments.length; s++) {
			var segment = this.segments[s];
			var foundSelfIntersection = false;
			var intersectionPosition;
			var nextSegmentIndex;
			var otherSegment;
			var offsetOnOtherSegment;

			for (var o = s + 1; o < this.segments.length + 1; o++) {
				otherSegment = this.segments[o % this.segments.length];

				var intersectionInfos = intersect(segment, otherSegment);

				if (intersectionInfos.length > 0) {
					intersectionPosition = intersectionInfos[0].p;
					offsetOnOtherSegment = otherSegment.offsetOf(intersectionPosition);

					if (offsetOnOtherSegment > eps && offsetOnOtherSegment < otherSegment.length - eps) {
						//DebugPoints.add(vec2.toThree(intersectionPosition), 0xff0000, "si");
						foundSelfIntersection = true;
						nextSegmentIndex = o - 1;
						break;
					}
				}
			}

			if (previousIntersectionPosition) {
				var offsetOfPreviousIntersection = segment.offsetOf(previousIntersectionPosition);
				var directionOfPreviousIntersection = segment.directionOf(offsetOfPreviousIntersection);

				if (foundSelfIntersection && !roughlyEqualVec2(previousIntersectionPosition, intersectionPosition)) {
					newSegments.push(new Curve(previousIntersectionPosition, directionOfPreviousIntersection, intersectionPosition));
					s = nextSegmentIndex;
					previousIntersectionPosition = intersectionPosition;
				} else {
					newSegments.push(new Curve(previousIntersectionPosition, directionOfPreviousIntersection, segment.end));
					previousIntersectionPosition = undefined;
				}
			} else {
				if (foundSelfIntersection) {
					newSegments.push(new Curve(segment.start, segment.direction, intersectionPosition));
					s = nextSegmentIndex;
					previousIntersectionPosition = intersectionPosition;
				} else {
					newSegments.push(segment);
				}
			}

		}

		return new Path(newSegments);
	}

	weld (maxWeldDistance) {
		let longEnoughSegments = this.segments.filter(s => s.length > maxWeldDistance);
		let newSegments = [];
		for (let [segment, nextSegment] of It().windows(2).of(It.concat(longEnoughSegments, [longEnoughSegments[0]])())) {
			let newEnd = segment.end;

			if (roughlyEqualVec2(segment.end, nextSegment.start, maxWeldDistance)) {
				newEnd = nextSegment.start;
			}

			if (segment.isCurve)
				newSegments.push(new Curve(segment.start, segment.direction, newEnd));
			else newSegments.push(new LineSegment(segment.start, newEnd));
		}
		return new Path(newSegments);
	}

	scale (scalar) {
		var segments = new Array(this.segments.length);
		for (var i = 0; i < this.segments.length; i++) {
			var each = this.segments[i];
			segments[i] = each.scale(scalar);
		}
		return new Path(segments, this.isClockwise);
	}

	translate (offset) {
		function translate(offset) {
			var segments = new Array(this.segments.length);
			for (var i = 0; i < this.segments.length; i++) {
				var each = this.segments[i];
				segments[i] = each.translate(offset);
			}
			return new Path(segments, this.isClockwise);
		}
	}

	offsetPerpendicular (offsetToRight) {
		return new Path(this.segments.map(function (segment) {
			return segment.offsetPerpendicular(offsetToRight);
		}).filter(segment => segment));
	}

	offsetPerpendicularLength (offsetToRight) {
		var length = 0;
		for (var s = 0; s < this.segments.length; s++) {
			length += this.segments[s].offsetPerpendicularLength(offsetToRight);
		}
		return length;
	}

	mapPerpendicular (offsetA, offsetToRightA, offsetToRightB) {
		var currentSegment;
		var currentOffsetA = 0;
		var currentOffsetB = 0;
		var tolerance = 1e-2;

		for (var s = 0; s < this.segments.length; s++) {
			currentSegment = this.segments[s];
			var segmentLengthA = currentSegment.offsetPerpendicularLength(offsetToRightA);
			var segmentLengthB = currentSegment.offsetPerpendicularLength(offsetToRightB);
			var nextOffsetA = currentOffsetA + segmentLengthA;
			var nextOffsetB = currentOffsetB + segmentLengthB;

			if (nextOffsetA > offsetA - tolerance) {
				var offsetAOnSegment = offsetA - currentOffsetA;
				var offsetBOnSegment = currentSegment.mapPerpendicular(offsetAOnSegment, offsetToRightA, offsetToRightB);
				return currentOffsetB + offsetBOnSegment;
			} else {
				currentOffsetA = nextOffsetA;
				currentOffsetB = nextOffsetB;
			}

		}
	}

	// Return the segments that intersect
	intersections (b) {
		var aSegments = this.segments;
		var bSegments = b.segments;
		var allIntersections = [];
		for (var i = 0; i < aSegments.length; i++) {
			var aSegment = aSegments[i];
			for (var j = 0; j < bSegments.length; j++) {
				var bSegment = bSegments[j];
				var relativeIntersections = intersect(aSegment, bSegment);

				for (var r = 0; r < relativeIntersections.length; r++) {
					var intersection = relativeIntersections[r];

					// u,v is meant to be a value between 0,1 - shouldn't they all get scaled?
					intersection.u += i;
					intersection.v += j;

					allIntersections.push(intersection);
				}
			}
		}
		return allIntersections;
	}

	// Use a 'crossings number' to determine if p is inside the path
	containsPoint(p) {
		if (!this.isClosed)
			return false;

		// Should use an actual Ray here, but the intersections code for
		// Ray-Line, Ray-Curve hasn't been written yet, only Ray-Ray
		var segments = this.segments,
			crossings = 0,
			degenerate = false,
			ray = new LineSegment(p, vec2.fromValues(this.boundingBox.right + 1, p[1]));
		for (var i = 0; i < segments.length; i++) {
			var potentials = intersect(ray, segments[i]);
			//console.log("containsPoint step", i + "/" + (segments.length - 1), potentials.length);

			for (var j = 0; j < potentials.length; j++) {
				if (potentials[j].uIsDegenerate) {
					//console.warn("containsPoint uIsDegenerate", potentials[j]);
					return true;
				}
				if (potentials[j].vIsDegenerate) {
					degenerate = true;
					break;
				}
			}
			if (degenerate) {
				// If a point is degenerate, restart the search
				//console.log("containsPoint vIsDegenerate", potentials[j]);
				i = -1;
				crossings = 0;
				degenerate = false;
				// make the ray longer and rotate it
				let alongRayLonger = vec2.sub(vec2(0, 0), ray.end, ray.start);
				vec2.add(alongRayLonger, alongRayLonger, alongRayLonger);
				vec2.rotate(alongRayLonger, alongRayLonger, 0.5);
				vec2.add(ray.end, ray.start, alongRayLonger);
				continue;
			}

			crossings += potentials.length;
		}
		//console.log("crossings: " + crossings + " => contained: " + ((crossings & 1) == 1));
		//console.canvas(Drawing2D.canvas([this, ray]));
		//console.log("containsPoint crossings", crossings);
		return (crossings & 1) == 1;
	}

	offsetOf (p, returnInvalid) {
		var closestSegmentIndex;
		var closestDistance = Number.POSITIVE_INFINITY;
		var closestOffset;
		var closestInvalidOffset;
		var closestInvalidSegmentIndex;
		var tolerance = 1e-2;

		for (var s = 0; s < this.segments.length; s++) {
			var segment = this.segments[s];
			var closestPoint = segment.closestPointTo(p);
			if (closestPoint) {
				var distance = vec2.dist(p, closestPoint);

				if (distance < closestDistance) {
					var offset = segment.offsetOf(p);
					if (offset >= -tolerance && offset <= segment.length + tolerance) {
						closestDistance = distance;
						closestSegmentIndex = s;
						closestOffset = offset;
					} else {
						closestInvalidOffset = offset;
						closestInvalidSegmentIndex = s
					}
				}
			}
		}

		if (closestOffset !== undefined)
			return closestOffset + this.segmentOffsets[closestSegmentIndex];
		else if (returnInvalid)
			return closestInvalidOffset + this.segmentOffsets[closestInvalidSegmentIndex];
	}

	closestPointTo (p, noEndPoints) {
		var closestPoint;
		var closestPointAtEndOfSegment;
		var closestDistance = Number.POSITIVE_INFINITY;
		var closestDistanceFromEndOfSegment = Number.POSITIVE_INFINITY;
		var tolerance = 1e-2;

		for (var s = 0; s < this.segments.length; s++) {
			var segment = this.segments[s];
			var closestPointOnSegment = segment.closestPointTo(p);
			if (closestPointOnSegment) {
				var distance = vec2.dist(p, closestPointOnSegment);

				if (distance < closestDistance) {
					closestDistanceFromEndOfSegment = distance;
					closestPointAtEndOfSegment = closestPointOnSegment;

					var offset = segment.offsetOf(p);
					if (offset >= -tolerance && offset <= segment.length + tolerance) {
						closestDistance = distance;
						closestPoint = closestPointOnSegment;
					}
				}
			}
		}

		return closestPoint || (noEndPoints ? undefined : closestPointAtEndOfSegment);
	}

	positionOf (offset) {
		var segmentWithPoint = this.segments[0];
		var segmentWithPointOffset = 0;

		for (var s = 0; s < this.segments.length; s++) {
			if (this.segmentOffsets[s] > offset)
				break;
			if (this.segmentOffsets[s] < offset) {
				segmentWithPoint = this.segments[s];
				segmentWithPointOffset = this.segmentOffsets[s];
			}
		}

		return segmentWithPoint.positionOf(offset - segmentWithPointOffset);
	}

	directionOf (offset) {
		var segmentToUse;
		var segmentOffset;

		for (var s = 0; s < this.segments.length; s++) {
			if (this.segmentOffsets[s] > offset) {
				segmentToUse = this.segments[s - 1];
				segmentOffset = this.segmentOffsets[s - 1];
				break;
			}
		}

		if (!segmentToUse) {
			segmentToUse = this.segments[ this.segments.length-1];
			segmentOffset = this.segmentOffsets.last();
		}

		return segmentToUse.directionOf(offset - segmentOffset);
	}

	static packedSize (path) {
		return path.segments.length * 2 * 3 * BinaryTypes.getByteSize("FloatLE");
	}

	static pack (path, buffer, offset, maxSize) {
		let fSize = BinaryTypes.getByteSize("FloatLE");

		for (let segment of path.segments) {
			buffer.writeFloatLE(segment.start[0]); offset += fSize;
			buffer.writeFloatLE(segment.start[1]); offset += fSize;

			buffer.writeFloatLE(segment.direction[0]); offset += fSize;
			buffer.writeFloatLE(segment.direction[1]); offset += fSize;

			buffer.writeFloatLE(segment.end[0]); offset += fSize;
			buffer.writeFloatLE(segment.end[1]); offset += fSize;
		}
	}

	static unpack (buffer, offset, size) {
		let nSegments = size / (2 * 3 * BinaryTypes.getByteSize("FloatLE"));
		let segments = new Array(nSegments);
		let fSize = BinaryTypes.getByteSize("FloatLE");

		for (let i = 0; i < nSegments; i++) {
			let startX = buffer.readFloatLE(offset); offset += fSize;
			let startY = buffer.readFloatLE(offset); offset += fSize;
			let directionX = buffer.readFloatLE(offset); offset += fSize;
			let directionY = buffer.readFloatLE(offset); offset += fSize;
			let endX = buffer.readFloatLE(offset); offset += fSize;
			let endY = buffer.readFloatLE(offset); offset += fSize;

			segments[i] = new Curve(
				vec2(startX, startY), vec2(directionX, directionY), vec2(endX, endY)
			);
		}

		return new Path(segments);
	}

	dump () {
		console.log("path dump");
		for (var i = 0; i < this.segments.length; i++) {
			var segment = this.segments[i];
			console.log(
				"\t" + (i + 1) + "/" + this.segments.length,
				segment.type.typeName,
				segment.start[0] + ", " + segment.start[1],
				"to",
				segment.end[0] + ", " + segment.end[1]);
		}
	}

	get debug () {
		DebugPaths.add(this, 0x0000ff, "debug", 0, 1);
		return "shown";
	}

	vertices (offsetToRight, minPointDistance) {
		var vertices = [];
		var lastVertex;

		for (var s = 0; s < this.segments.length; s++) {
			var segment = this.segments[s];
			var segmentVertices = segment.vertices(offsetToRight);

			for (var v = 0; v < segmentVertices.length; v++) {
				var vertex = segmentVertices[v];

				if (!minPointDistance || !lastVertex || vec2.dist(lastVertex, vertex) > minPointDistance)
					vertices.push(vertex);

				lastVertex = vertex;
			}
		}

		if (minPointDistance && this.isClosed) vertices.pop();

		return vertices;
	}

	uvs (offsetToRight, multiplierAlongPath) {
		var uvs = [];

		for (var s = 0; s < this.segments.length; s++) {
			var segment = this.segments[s];
			var segmentOffset = this.segmentOffsets[s];

			uvs = uvs.concat(segment.uvs(
				offsetToRight, multiplierAlongPath
			).map(function (uv) {
				uv[0] += segmentOffset * multiplierAlongPath;
				return uv;
			}));
		}

		return uvs;
	}

	draw (context) {
		const DEBUG_DRAW_JOINTS = false;
		if (!this.segments.length) return;

		context.stroke(this);

		if (!DEBUG_DRAW_JOINTS) return;
		context.dot(this.segments[0].start);
		for (let segment of this.segments) {
			context.dot(segment.end);
		}
	}
}

// For an array of segments, determine if they are clockwise or counter-clockwise
function orientation(segments) {
	var sum = 0;
	for (var i = 0; i < segments.length; i++) {
		var segment = segments[i],
			dx = segment.end[0] - segment.start[0],
			dy = segment.end[1] + segment.start[1];
		sum += dx * dy;
	}
	return sum > 0;
}

// Find the boundingBox for an array of segments
var MAX_VALUE = Number.MAX_VALUE,
	MIN_VALUE = Number.MIN_VALUE;
function aabb(segments) {
	var origin = vec2.fromValues(MAX_VALUE, MAX_VALUE),
		corner = vec2.fromValues(MIN_VALUE, MIN_VALUE);
	for (var i = 0; i < segments.length; i++) {
		var segment = segments[i];
		var bb = segment.boundingBox;
		origin[0] = Math.min(origin[0], bb.origin[0]);
		origin[1] = Math.min(origin[1], bb.origin[1]);
		corner[0] = Math.max(corner[0], bb.corner[0]);
		corner[1] = Math.max(corner[1], bb.corner[1]);
	}
	return RectangleCorner(origin, corner);
}