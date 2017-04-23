import Ray from '../primitives/Ray';
import Line from '../primitives/Line';
import intersect from '../intersections/Intersections';
import vec2 from '../nd-linalg/Vector2';
import vec3 from '../nd-linalg/Vector3';
import { roughlyEqual } from '../missing-stuff';
import * as SkeletonEdge from './SkeletonEdge';
import SkeletonWavefront from './SkeletonWavefront';

var id = 0;
var infinity = Infinity;
var ROUGHLY_EPSILON = Number.ROUGHLY_EPSILON;
export default class SkeletonSplitEvent {
	constructor(edge, vertex) {
		this.id = id++;
		this.edge = edge;
		this.vertex = vertex;

//		if (this.edge.isSelfIntersectionCap)
//			return this.time = infinity;

		let intersections = intersect(vertex.projection, edge.line);
		if (intersections.length == 0)
			return this.time = infinity;

		// Find the bisector(s)
		let projectionToEdgePosition = intersections[0].p;
		intersections = intersect(edge.line, vertex.previousEdge.line);
		if (intersections.length == 0) {
			// the two edges are parallel to each other, find the midpoint between them for the bisector
			let midpoint = vec2.lerp(vec2(0, 0), edge.start.position, vertex.previousEdge.start.position, 0.5);
			var bisector = new Line(midpoint, vertex.previousEdge.lineDirection);
		} else {
			let edgeToEdgePosition = intersections[0].p,
				dir1 = vec2.sub(vec2(0, 0), vertex.position, edgeToEdgePosition),
				dir2 = vec2.sub(vec2(0, 0), projectionToEdgePosition, edgeToEdgePosition);

			vec2.normalize(dir1, dir1);
			vec2.normalize(dir2, dir2);
			let direction = vec2.add(vec2(0, 0), dir1, dir2);
			vec2.normalize(direction, direction);
			var bisector = new Ray(edgeToEdgePosition, direction);
		}

		// Find the point of split
		intersections = intersect(vertex.projection, bisector);
		if (intersections.length === 0)
			return this.time = infinity;

		// How far from the vertex to the bisector
		let length = edge.lengthAt(intersections[0].p);
		if (length < 0 || length === infinity)
			return this.time = infinity;

		this.time = length + this.edge.wavefront.time;
		//Drawing2D.log("created " + this.description(), [this.edge.wavefront, this, {colour: "pink", legend: "bisector", visuals: [bisector]}]);
	}

	name() {
		if (!this.edge.wavefront || this.edge.wavefront != this.vertex.wavefront)
			return "Split(dead)";
		let projected = this.edge.projectBy(this.time - this.edge.wavefront.time),
			position = this.vertex.projectBy(this.time - this.edge.wavefront.time);
		let distance1 = vec2.dist(this.edge.start.position, this.vertex.position),
			distance2 = vec2.dist(this.edge.end.position, this.vertex.position);
		if (roughlyEqual(distance1, 0))
			return "Cut.start";
		if (roughlyEqual(distance2, 0))
			return "Cut.end";
		else
			return "Split";
	}

	isValid() {
		// The event must be on an existing wavefront and both the edge and vertex must also be on the same wavefront
		if (!this.edge.wavefront || this.edge.wavefront != this.vertex.wavefront)
			return false;

		// No events are allowed to happen immediately, that would require a self-intersecting source shape and that is not allowed for this algorithm. The only other way this can happen is with an open-path and no events should happen at instance-zero then either
		if (this.time === 0)
			return false;

		// No split or cut can happen with < 4 edges
		if (this.edge.wavefront.length < 4)
			return false;

		// Is the vertex still acute?
		if (this.vertex.isAcute)
			return false;

		// Is the event time infinite?
		if (this.time === infinity)
			return false;

		// Is the event actually happening?
		let futureEdge = this.edge.projectBy(this.time - this.edge.wavefront.time),
			futureVertex = this.vertex.projectBy(this.time - this.edge.wavefront.time);
		return futureEdge.roughlyContainsPoint(futureVertex);
	}

	remove() {
		const _this = this;
		this.vertex.events = this.vertex.events.filter( function( ele ){
			return ele !== _this;
		});
		// this.vertex.events = this.vertex.events.without(this);
	}

	description() {
		return `${this.name()}:${this.id} edge ${this.edge.id} from between ${this.vertex.previousEdge.id} and ${this.vertex.nextEdge.id} at ${this.time}`;
	}

	process() {
		let distance1 = vec2.dist(this.edge.start.position, this.vertex.position);
		if (roughlyEqual(distance1, 0))
			return cut(this.edge.start, this.vertex);

		let distance2 = vec2.dist(this.edge.end.position, this.vertex.position);
		if (roughlyEqual(distance2, 0))
			return cut(this.edge.end, this.vertex);

		// The vertex.position was roughly contained within the edge, but not close
		// enough to have a roughly close distance to either end and when we test
		// if it's really contained and it is not, then it must still be treated as
		// a cut
		if (!this.edge.segment.boundingBox.containsPoint(this.vertex.position))
			return distance1 < distance2
				 ? cut(this.edge.start, this.vertex)
				 : cut(this.edge.end, this.vertex);

		return split(this.edge, this.vertex);
	}

	draw(context) {
		context.style = "#F00";
		context.legend("this.edge");
		this.edge.draw(context);

		context.style = "#F66";
		context.legend("this.edge - future");
		this.edge.projectBy(this.time - this.edge.wavefront.time).draw(context);

		context.style = "#00F";
		context.legend("this.vertex");
		this.vertex.previousEdge.draw(context);
		this.vertex.nextEdge.draw(context);

		context.style = "#66F";
		context.legend("this.vertex - future");
		this.vertex.previousEdge.projectBy(this.time - this.edge.wavefront.time).draw(context);
		this.vertex.nextEdge.projectBy(this.time - this.edge.wavefront.time).draw(context);

		context.style = "rgba(0, 0, 255, 0.25)";
		context.legend("this.vertex - projection");
		this.vertex.projection.draw(context);

		context.style = "#300";
		context.legend("intersection");
		context.dot(this.vertex.projectBy(this.time - this.edge.wavefront.time));
	}
}

function join(previous, next, length) {
	// find the point at which these two edges connect and 'extend' or 'contract' the edges until they meet to preserve the direction of both edges
	let intersections = intersect(previous.line, next.line),
		moved = intersections.length > 0;
	if (moved) {
		next.start.position = intersections[0].p;
		next.wavefront.processor.commitSkeletonVertex(next.start);
	}

	// connect the edges
	SkeletonEdge.connect([previous, next]);

	// did we twist an edge trying to do this, if so, try again skipping the twisted edge
	if (moved) {
		let twist1 = intersect(previous.previous.segment, next.segment);
		if (twist1.length > 0 && !twist1[0].isDegenerate)
			return join(previous.previous, next, length + 1);
		let twist2 = intersect(previous.segment, next.next.segment);
		if (twist2.length > 0 && !twist2[0].isDegenerate)
			return join(previous, next.next, length + 1);
	}

	// compute direction and speed
	next.start.computeDirectionAndSpeed();

	// compute collapse events
	previous.computeCollapseEvent();
	next.computeCollapseEvent();

	// compute split events
	next.start.computeSplitEvents();

	return [previous, next, length];
}

function cut(edgeVertex, cutVertex) {
	if (edgeVertex === cutVertex)
		return false;

	edgeVertex.wavefront.processor.commitSkeletonVertex(edgeVertex);
	cutVertex.wavefront.processor.commitSkeletonVertex(cutVertex);

	let wavefront0 = edgeVertex.wavefront,
		wavefront1 = null,
		previous0 = edgeVertex.previousEdge,
		previous1 = cutVertex.previousEdge,
		next0 = cutVertex.nextEdge,
		next1 = edgeVertex.nextEdge,
		length0 = 0,
		length1 = 0;

	[previous0, next0, length0] = join(previous0, next0, length0);
	[previous1, next1, length1] = join(previous1, next1, length1);

	// create the new wavefront
	wavefront0.root = previous0;
	wavefront1 = new SkeletonWavefront(
		wavefront0.processor,
		previous1,
		wavefront0.time);
	wavefront0.length -= wavefront1.length + length0 + length1;

	//SkeletonEdge.isBroken(previous0);
	//SkeletonEdge.isBroken(previous1);

	// it's possible at this point that one of the two wavefronts
	// has < 3 vertices. If that's the case, we might as well
	// delete it now and add its spokes, otherwise make sure the
	// two wavefronts exist in the processor
	function endit(wavefront) {
		wavefront.processor.commitSkeletonVertex(wavefront.root.start);
		wavefront.processor.commitSkeletonVertex(wavefront.root.end);
		wavefront.processor.commitSkeletonSpoke(
			vec3(wavefront.root.start.position[0], wavefront.root.start.position[1], wavefront.time),
			vec3(wavefront.root.end.position[0], wavefront.root.end.position[1], wavefront.time));
	}
	if (wavefront0.length < 3) {
		endit(wavefront0);
		wavefront0.remove();
	} else {
		// wavefront[0] already exists in the processor
	}
	if (wavefront1.length < 3) {
		endit(wavefront1)
		wavefront1.root.next.wavefront = null;
		wavefront1.root.wavefront = null;
	} else {
		wavefront1.processor.addWavefront(wavefront1);
	}
	return true;
}

function split(edge, vertex) {
	let pair = edge.split(vertex.position);

	// compute direction and speed
	pair[1].start.computeDirectionAndSpeed();

	// compute collapse events
	// SKIPPED: cut will do it

	// compute split events for the two halves
	// pair[1].start is not acute and we do not have to compute its split events
	pair[0].computeSplitEvents();
	pair[1].computeSplitEvents();

	return cut(pair[1].start, vertex);
}
