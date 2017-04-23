import Ray from '../primitives/Ray';
import Line from '../primitives/Line';
import * as Triangle from '../primitives/Triangle';
import { roughlyEqual, roughlyEqualVec2 } from '../missing-stuff';
import intersect from '../intersections/Intersections';
import vec2 from '../nd-linalg/Vector2';
import vec3 from '../nd-linalg/Vector3';

var id = 0;
var infinity = Infinity;
export default class SkeletonCollapseEvent {
	constructor(edge) {
		this.id = id++;
		this.edge = edge;

		let wavefront = edge.wavefront,
			intersections = intersect(edge.start.projection, edge.end.projection);

		if (intersections.length === 0)
			return this.time = infinity;

		this.position = intersections[0].p;
		this.time = edge.lengthAt(this.position) + wavefront.time;

		//if (this.time === 0)
		//	return this.time = infinity;
	}

	name() {
		if (!this.edge.wavefront || this.edge.wavefront.length < 3) return "SkeletonCollapseEvent(dead)";
		return this.edge.wavefront.length === 3
			? "Triangle"
			: "Collapse";
	}

	isValid() {
		if (!this.edge.wavefront)
			return false;

		// No events are allowed to happen immediately, that would require a self-intersecting source shape and that is not allowed for this algorithm. The only other way this can happen is with an open-path and no events should happen at instance-zero then either
		if (this.time === 0)
			return false;

		switch(this.edge.wavefront.length) {
			case 0:
			case 1:
			case 2:
				return false;
			case 3:
				return true;
			default: {
				// an edge cannot collapse if either of its projections are parallel to the edge
				const az = vec2.crossz(this.edge.lineDirection, this.edge.start.direction);
				const bz = vec2.crossz(this.edge.lineDirection, this.edge.end.direction);
				return !roughlyEqual(az,0)
					&& !roughlyEqual(bz,0);
			}
		}
	}

	remove() {
		this.time = infinity;
	}

	description() {
		return `${this.name()}:${this.id} edge ${this.edge.id} at ${this.time}`;
	}

	process() {
		let wavefront = this.edge.wavefront;
		wavefront.processor.commitSkeletonVertex(this.edge.start);
		wavefront.processor.commitSkeletonVertex(this.edge.end);

		if (wavefront.length === 3) {
			let position = this.time === infinity ? this.edge.start.position : this.position;

			// commit the third vertex of the triangle
			wavefront.processor.commitSkeletonVertex(this.edge.next.end);

			// we know that -one- of the sides of the triangle has collapsed, but it's possible
			// the other two have not, they might now be parallel lines that overlap.
			// If that is the case, find one of the uncollapsed sides and connect it to the
			// triangle center
			let a = this.edge.start.position,
				b = this.edge.end.position,
				c = this.edge.next.end.position,
				center = Triangle.center(a, b, c);

			let start = a, end = b;
			if (roughlyEqualVec2(a, b)) {
				if (roughlyEqualVec2(b, c)) {
					start = c;
					end = a;
				} else {
					start = b;
					end = c;
				}
			}

			center = vec3(center[0], center[1], wavefront.time);
			start = vec3(start[0], start[1], wavefront.time);
			end = vec3(end[0], end[1], wavefront.time);
			wavefront.processor.commitSkeletonSpoke(start, center);
			wavefront.processor.commitSkeletonSpoke(center, end);

			wavefront.remove();
			return true;
		}

		let previous = this.edge.previous,
			next = this.edge.next;

		// collapse this.edge
		this.edge.collapse();

		// compute the direction and speed for the newly connected vertex
		next.start.computeDirectionAndSpeed();

		// compute the collapse events for the neighbours
		previous.computeCollapseEvent();
		next.computeCollapseEvent();

		// compute the split events for the connected vertex which may now be obtuse
		next.start.computeSplitEvents();

		return true;
	}

	draw(context) {
		if (this.wavefront.length === 3) {
			context.dot(this.position);
			return this.wavefront.draw(context);
		}

		this.edge.draw(context);
		context.dot(this.position);

		context.alpha = 0.25;

		this.edge.start.projection.draw(context);
		this.edge.end.projection.draw(context);
	}
}
