var infinity = Infinity;
import SkeletonVertex from './SkeletonVertex';
import SkeletonCollapseEvent from './SkeletonCollapseEvent';
import SkeletonSplitEvent from './SkeletonSplitEvent';
import vec2 from '../nd-linalg/Vector2';
import Chain from '../datastructures/Chain';
import Ray from '../primitives/Ray';
import Line from '../primitives/Line';
import intersect from '../intersections/Intersections';
import LineSegment from '../primitives/LineSegment';

export var InnerEdge = Symbol("InnerEdge"),
	OuterEdge = Symbol("OuterEdge"),
	StartCapEdge = Symbol("StartCapEdge"),
	EndCapEdge = Symbol("EndCapEdge");

export function create(path, isInfinite) {
	// console.log('isclosed', path.isClosed);
	return path.isClosed
		 ? createClosedPath(path, isInfinite)
		 : createOpenPath(path, isInfinite);
}

function createClosedPath(path, isInfinite) {
	let segments = path.segments,
		first = new SkeletonEdge(segments[0].start, InnerEdge),
		previous = first;
	for (let i = 1; i < segments.length; i++) {
		let next = new SkeletonEdge(segments[i].start, InnerEdge);
		connect([previous, next]);
		previous = next;
	}
	connect([previous, first]);
	//Chain.isBroken(first);

	if (isInfinite) return [first];

	let second = new SkeletonEdge(segments[segments.length-1].end, OuterEdge);
	previous = second;
	for (let i = segments.length - 2; i >= 0; i--) {
		let next = new SkeletonEdge(segments[i].end, OuterEdge);
		connect([previous, next]);
		previous = next;
	}
	connect([previous, second]);
	//Chain.isBroken(second);

	return [first, second];
}

function createOpenPath(path, isInfinite) {
	if (isInfinite)
		throw "Cannot propagate an open path wavefront infinitely";

	let segments = path.segments,
		edges = new Array(segments.length * 2 + 2),
		i = 0;

	for (let segment of segments.slice().reverse())
		edges[i++] = new SkeletonEdge(segment.end, OuterEdge);
	edges[i++] = new SkeletonEdge(segments[0].start, StartCapEdge);

	for (let segment of segments)
		edges[i++] = new SkeletonEdge(segment.start, InnerEdge);
	edges[i] = new SkeletonEdge(segments[segments.length-1].end, EndCapEdge);

	connect(edges);
	connect([edges[edges.length-1], edges[0]]);
	//Chain.isBroken(edges[0]);

	return [edges[0]];
}

export function connect(edges) {
	if (edges.length < 2)
		throw "Need at least two edges to connect";

	// connect the list of edges
	let previous = edges[0];
	for (var i = 1; i < edges.length; i++) {
		let next = edges[i];
		Chain.connect(previous, next);
		previous = next;
	}
}

export function isBroken(root) {
	let length = 0;
	Chain.isBroken(root);
	for (let edge of root) {
		length++;
		if (edge.start.nextEdge !== edge)
			throw "Edge vertex inconsistent";
		if (edge.segment.start !== edge.start.position)
			throw "Edge segment.start inconsistent";
		if (edge.segment.end !== edge.end.position)
			throw "Edge segment.end inconsistent";
	}
	if (root.wavefront.length != length)
		throw "What?";
}

var id = 0;
class SkeletonEdge {
	constructor(start, side) {
		this.id = id++;
		this.side = side;
		this.start = new SkeletonVertex(start, this);
		this.wavefront = null;
		this.next = this;
		this.previous = this;
		this.isCap = this.side === StartCapEdge || this.side === EndCapEdge;

		this.direction = null;
		this.lineDirection = null;
		this.collapseEvent = null;
	}

	get name() { return "SkeletonEdge"; }
	get end() { return this.next.start; }
	get segment() { return new LineSegment(this.start.position, this.end.position); }
	get line() { return new Line(this.start.position, this.lineDirection); }

	computeDirection() {
		let startPosition = this.start.position,
			endPosition = this.end.position;

		if (this.isCap &&
			startPosition[0] == endPosition[0] &&
			startPosition[1] == endPosition[1]) {
			let previousDirection = this.previous.direction;
			this.direction = vec2(previousDirection[1], -previousDirection[0]);
			this.lineDirection = vec2.clone(previousDirection);
			return;
		}

		this.lineDirection = vec2.sub(vec2(0, 0), endPosition, startPosition);
		vec2.normalize(this.lineDirection, this.lineDirection);
		this.direction = vec2(-this.lineDirection[1], this.lineDirection[0]);
	}

	checkSanity() {
		let sane = false;
		let ray = new Ray(this.segment.midpoint, this.direction);
		for (let edge of this.next) {
			if (edge !== this) {
				if (intersect(edge.segment, ray).length > 0) {
					sane = true;
					break;
				}
			}
		}
		if (!sane) throw "Hangon...";
	}

	checkOverlap() {
		if (roughlyEqual(this.segment.length, 0)) return;
		intersect(this.previous.segment, this.next.segment).length > 0 && thisshouldnotbehappening();
	}

	computeCollapseEvent() {
		this.collapseEvent = new SkeletonCollapseEvent(this);
	}

	computeSplitEvents() {
		let edge = this.next.next.next,
			end = this.previous;

		while(true) {
			if (edge === end) break;
			let vertex = edge.start;
			vertex.isAcute || vertex.events.push(new SkeletonSplitEvent(this, vertex));
			edge = edge.next;
		}
	}

	* [Symbol.iterator]() {
		var current = this;
		while(true) {
			yield current;
			current = current.next;
			if (current === this) break;
		}
	}

	// At a position p, assuming p is between start.projection and end.projection
	// return how long it will be before the edge reaches p
	lengthAt(p) {
		var measuring = vec2(-this.direction[0], -this.direction[1]);
		var intersections = intersect(new Ray(p, measuring), this.line);

		// If the point is behind the moving wavefront, return an infinite length
		return intersections.length === 0 ? infinity : intersections[0].u;
	}

	projectBy(amount) {
		return new LineSegment(this.start.projectBy(amount), this.end.projectBy(amount));
	}

	collapse() {
		// if we're the root edge, cycle to another edge
		if (this.wavefront.root === this)
			this.wavefront.root = this.next;

		let previous = this.previous,
			next = this.next;

		connect([previous, next]);
		this.wavefront.length--;
		//isBroken(previous);

		// delete the edge and therefore any split/cut events for this edge
		this.wavefront = null;
	}

	split(position) {
		// if we're the root edge, cycle to another edge
		if (this.wavefront.root === this)
			this.wavefront.root = this.next;

		var previous = this.previous,
			middle1 = new SkeletonEdge(this.start.position, previous.side),
			middle2 = new SkeletonEdge(position, previous.side),
			next = this.next;

		// keep the current start
		middle1.start = this.start;
		middle1.start.nextEdge = middle1;

		// Copy the properties
		middle1.wavefront = this.wavefront;
		middle2.wavefront = this.wavefront;
		middle1.direction = vec2.clone(this.direction);
		middle2.direction = vec2.clone(this.direction);
		middle1.lineDirection = vec2.clone(this.lineDirection);
		middle2.lineDirection = vec2.clone(this.lineDirection);

		// Quick set the new vertex
		middle2.start.isAcute = false;
		middle2.start.isParallel = true;
		middle2.start.speed = 1;
		middle2.start.direction = vec2.clone(this.direction);
		middle2.start.projection = new Ray(middle2.start.position, middle2.start.direction);

		connect([previous, middle1, middle2, next]);
		this.wavefront.length++;
		//isBroken(previous);

		// delete the edge and therefore any split/cut events for this edge
		this.wavefront = null;

		return [middle1, middle2];
	}

	draw(context) {
		if (!this.wavefront) return;
		if (this.cutreverse) {
			context.stroke(new LineSegment(this.segment.start, this.cutsegment.end));
			context.stroke(new LineSegment(this.cutsegment.start, this.segment.end));
		} else {
			context.stroke(this.cutsegment || this.segment);
			//context.arrowhead(this.segment.end, this.lineDirection);
		}
		context.dot(this.start.position);
		context.fontsize = 13;
		context.textBaseline = "center";
		context.textAlign = "center";
		context.text(this.id, this.segment.midpoint);
	}
}
