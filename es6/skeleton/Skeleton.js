/* TODO
 * Curves
	1) For curves that are shrinking, only a wavefront that is within its original
		circle can have a collision event with it
	2) For curves that are expanding, all vertices have a potential future event
		with the circle? can we limit this some how to only !acute vertices?
	3) A shrinking curve can collapse in on itself (radius=0)
 * Order the pathways from the center outward, return an array of paths rather than
 *   haphazard segments, building them up from outside in, merging as it intersects
 *
 * Find the center line:
 *  1) Find the longest spoke-tospoke
 *  2) Remove tiny segments
 *  3) Remove the first and last segment
 *  4) Extent the first and last segment to intersect the nearest original edge
 */

var DeadEdge = Symbol("DeadEdge");
var infinity = Infinity;
export default class StraightSkeleton {
	constructor(path, length, options) {
		options = options || {};
		this.length = length || infinity;
		this.spokes = [];
		this.waves = [];

		this.DEBUG_DRAW_INITIAL = options.DEBUG_DRAW_INITIAL || false;
		this.DEBUG_DRAW_SKIPPED_EVENTS = options.DEBUG_DRAW_SKIPPED_EVENTS || false;
		this.DEBUG_DRAW_STEPS = options.DEBUG_DRAW_STEPS || false;
		this.DEBUG_DRAW_MOVE = options.DEBUG_DRAW_MOVE || this.DEBUG_DRAW_STEPS;
		this.DEBUG_DRAW_OBTUSE_EVENTS_EACH_STEP = options.DEBUG_DRAW_OBTUSE_EVENTS_EACH_STEP || false;

		if ("capWeight" in options) {
			let startDirection = vec2.scale(vec2(0, 0), path.segments[0].direction, -1),
				startNormal = [-startDirection[1], startDirection[0]],
				endDirection = path.segments[path.segments.length - 1].direction,
				endNormal = [-endDirection[1], endDirection[0]];

			let a = vec2.lerp(vec2(0, 0), startDirection, startNormal, 1 - options.capWeight);
			let b = vec2.lerp(vec2(0, 0), startDirection, startNormal, options.capWeight);
			let c = vec2.lerp(vec2(0, 0), endDirection, endNormal, 1 - options.capWeight);
			let d = vec2.lerp(vec2(0, 0), endDirection, endNormal, options.capWeight);

			this.caps = [
				new Ray(path.start, [b[1], -b[0]]),
				new Ray(path.start, a),

				new Ray(path.end, [d[1], -d[0]]),
				new Ray(path.end, c),
			];
		}

		this.wavefronts = SkeletonEdge
			.create(path, this.length === infinity, this.cap)
			.map(each => new SkeletonWavefront(this, each, 0).initialise());

		//this.process();
		options.DEBUG ? this.debugprocess() : this.process();
	}

	get name() { return "StraightSkeleton"; }

	process() {
		while(this.wavefronts.length > 0) {
			let wavefront = this.wavefronts[0];
			if (!wavefront.process(this.length)) {
				if (this.length === infinity) throw "EventsExhaustedPrematurely";
				this.commitWavefront(wavefront);
				wavefront.remove();
			}
		}
	}

	debugprocess() {
		while(this.wavefronts.length > 0) {
			let wavefront = this.wavefronts[0];
			if (!wavefront.debugprocess(this.length)) {
				if (this.length === infinity) throw "EventsExhaustedPrematurely";
				this.commitWavefront(wavefront);
				wavefront.remove();
			}
		}
	}

	addWavefront(wavefront) {
		this.wavefronts.push(wavefront);
	}

	removeWavefront(wavefront) {
		this.wavefronts.splice(this.wavefronts.indexOf(wavefront), 1);
	}

	commitSkeletonSpoke(start, end) {
		this.spokes.push(new LineSegment(vec3.clone(start), vec3.clone(end)));
	}

	commitSkeletonVertex(vertex) {
		let beginning = vec3(vertex.position[0], vertex.position[1], vertex.wavefront.time);
		this.commitSkeletonSpoke(vertex.beginning, beginning);
		vertex.beginning = beginning;
	}

	commitWavefront(wavefront) {
		for (let edge of wavefront.root)
			this.commitSkeletonVertex(edge.start);

		if (!("caps" in this))
			return this.commitFullWavefront(wavefront);

		// Find all the caps
		let caps = [];
		for (let edge of wavefront.root)
			if (edge.isCap) caps.push(edge);

		if (caps.length === 0)
			return this.commitFullWavefront(wavefront);

		// iterate forward, then backward, marking edges as 'dead' until one
		// intersects the cut, which gets split at the cutting point, or another
		// cap is reached
		for (let cap of caps) {
			let cut = cap.side === SkeletonEdge.StartCapEdge ? this.caps[0] : this.caps[2];
			let current = cap;
			let dead = [];
			while(true) {
				let intersections = intersect(current.segment, cut);
				if (intersections.length !== 0) {
					current.cutsegment = new LineSegment(intersections[0].p, (current.cutsegment || current.segment).end);
					break;
				}

				if (!current.isCap) current.side = DeadEdge;
				dead.push(current);

				current = current.next;
				if (current.isCap) break;
			}

			cut = cap.side === SkeletonEdge.EndCapEdge ? this.caps[3] : this.caps[1];
			current = cap;
			dead = [];
			while(true) {
				let intersections = intersect(current.segment, cut);
				if (intersections.length !== 0) {
					if (current.cutsegment) current.cutreverse = true;
					current.cutsegment = new LineSegment((current.cutsegment || current.segment).start, intersections[0].p);
					break;
				}

				if (!current.isCap) current.side = DeadEdge;
				dead.push(current);

				current = current.previous;
				if (current.isCap) break;
			}
		}

		for (let cap of caps)
			if (!cap.cutsegment)
				cap.side = DeadEdge;

		this.commitFullWavefront(wavefront);
	}

	commitFullWavefront(wavefront) {
		let side = null, pather = null, segment = null;
		var commit = () => {
			if (pather && side !== DeadEdge)
				this.waves.push({"path": pather.path, "side": side});
		};

		for (let edge of wavefront.root) {
			segment = edge.cutsegment || edge.segment;
			if (side !== edge.side) {
				commit();
				side = edge.side;
				pather = new Pather();

				if (edge.cutreverse) {
					pather.moveTo(vec2.clone(edge.start.position));
					pather.lineTo(vec2.clone(edge.cutsegment.end));
					commit();
					pather = new Pather();
					pather.moveTo(vec2.clone(edge.cutsegment.start));
				} else {
					pather.moveTo(vec2.clone(segment.start));
				}
			}
			if (edge.cutreverse) {
				pather.lineTo(vec2.clone(edge.segment.end));
			} else {
				pather.lineTo(vec2.clone(segment.end));
			}
		}
		commit();
	}

	draw(context) {
		for (let wavefront of this.wavefronts)
			wavefront.draw(context);
		for (let spoke of this.spokes)
			spoke.draw(context);
	}
}
