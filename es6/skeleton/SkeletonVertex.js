var id = 0;
export default class SkeletonVertex {
	constructor(position, nextEdge) {
		if (!isFinite(position[0]) || !isFinite(position[1]))
			throw "Bad vertex";

		this.id = id++;
		this.position = vec2.clone(position);
		this.beginning = vec3(position[0], position[1], 0);
		this.nextEdge = nextEdge;

		this.events = [];
		this.isParallel = null;
		this.isAcute = null;
		this.direction = null;
		this.projection = null;
		this.speed = null;
	}

	get name() { return "SkeletonVertex"; }
	get wavefront() { return this.nextEdge.wavefront; }
	get previousEdge() { return this.nextEdge.previous; }
	get next() { return this.nextEdge.end; }
	get previous() { return this.previousEdge.start; }

	computeDirectionAndSpeed() {
		// if direction and speed change, any split/cut events for this vertex
		// are now invalid
		this.events = [];

		let position = this.position;
		let nextEdge = this.nextEdge;
		let previousEdge = this.previousEdge;
		let orientation = vec2.crossz(previousEdge.direction, nextEdge.direction);
		let isParallel = this.isParallel = vec2.crossz(previousEdge.direction, nextEdge.direction).isRoughly(0);
		this.isAcute = isParallel || orientation > 0;

		// direction & projection
		let direction = this.direction = vec2.add(vec2(0, 0), previousEdge.direction, nextEdge.direction);
		vec2.normalize(direction, direction);
		this.projection = new Ray(position, direction);

		// speed
		if (isParallel) return this.speed = 1;
		let previousLine = new Line(
				vec2.add(vec2(0, 0), position, previousEdge.lineDirection),
				previousEdge.direction),
			nextLine = new Line(
				vec2.add(vec2(0, 0), position, nextEdge.lineDirection),
				nextEdge.direction),
			intersections = intersect(previousLine, nextLine);

		if (intersections.length === 0)
			return this.speed = 0;

		this.speed = vec2.dist(position, intersections[0].p);
	}

	computeSplitEvents() {
		this.events = [];
		if (this.isAcute) return;

		let start = this.nextEdge.next.next,
			end = this.previousEdge;
		while(true) {
			if (start === end) break;
			this.events.push(new SkeletonSplitEvent(start, this));
			start = start.next;
		}
	}

	movementBy(amount) {
		return vec2.scale(vec2(0, 0), this.direction, this.speed * amount);
	}

	projectBy(amount) {
		return vec2.add(vec2(0, 0), this.position, this.movementBy(amount));
	}

	move(amount) {
		vec2.add(this.position, this.position, this.movementBy(amount));
	}

	draw(context) {
		context.dot(this.position);

		context.style = "#AAF";
		this.projection && this.projection.draw(context);
	}
}
