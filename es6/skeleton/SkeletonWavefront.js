import { roughlyEqual } from '../missing-stuff';

const TIME_EPSILON = 1e-8;
var max = Math.max;
var infinity = Infinity;
var weakmap = WeakMap;

var id = 0;
export default class SkeletonWavefront {
	constructor(processor, root, time) {
		this.id = id++;
		this.processor = processor;
		this.root = root;
		this.time = time;

		// take ownership of edges and compute length
		var length = 0;
		for (let edge of root) {
			length++;
			edge.wavefront = this;
		}
		this.length = length;
	}

	initialise() {
		// compute initial edge direction
		let edge = this.root;
		while(true) {
			edge.computeDirection();
			edge = edge.next;
			if (edge === this.root) break;
		}

		// compute initial vertex direction and speed
		while(true) {
			edge.start.computeDirectionAndSpeed();
			edge = edge.next;
			if (edge === this.root) break;
		}

		// compute initial collapse events
		while(true) {
			edge.computeCollapseEvent();
			edge = edge.next;
			if (edge === this.root) break;
		}

		// compute initial cut/split events
		while(true) {
			edge.computeSplitEvents();
			edge = edge.next;
			if (edge === this.root) break;
		}

		return this;
	}

	process(maximum) {
		let events = [];
		while(true) {
			// compute events
			var nextEvents = this.nextEvents();

			// shortcut if we're done processing
			if (nextEvents.events.length === 0 || nextEvents.time > maximum) {
				this.move(maximum);
				return false;
			}

			// filter events
			for (let i = 0; i < nextEvents.events.length; i++) {
				let event = nextEvents.events[i];
				if (!event.isValid())
					event.remove();
				else
					events.push(event);
			}
			if (events.length > 0)
				break;

			events = [];
		}

		// process events
		this.move(nextEvents.time);
		for (let i = 0; i < nextEvents.events.length; i++) {
			let event = nextEvents.events[i];
			event.isValid() && event.process();
			event.remove();
		}

		return true;
	}

	debugprocess(maximum) {
		console.group("step");
		Drawing2D.log("before", this);

		let events;
		let depth = 0;
		while(true) {
			depth++;
			if (depth == 100) debugger;

			// compute events
			var nextEvents = this.nextEvents();

			// shortcut if we're done processing
			if (nextEvents.events.length === 0 || nextEvents.time > maximum) {
				this.move(maximum);
				Drawing2D.log("after move", this);
				console.groupEnd("step");
				return false;
			}

			// filter events
			events = [];
			for (let i = 0; i < nextEvents.events.length; i++) {
				let event = nextEvents.events[i];
				if (!event.isValid()) {
					console.log("removing", event.description());
					event.remove();
				}
				else
					events.push(event);
			}
			if (events.length > 0)
				break;
		}

		// process events
		this.move(nextEvents.time);
		Drawing2D.log("after move", this);
		for (let event of events) {
			if (event.isValid()) {
				console.log(event.description());
				event.process();
				this.processor.wavefronts.length > 0 && Drawing2D.log("after event", this.processor.wavefronts.concat([{colour: "#F0F", visuals: this.processor.spokes}]));
			} else {
				console.log("late removal of", event.description());
			}
			event.remove();
		}

		console.groupEnd("step");
		return true;
	}

	remove() {
		this.length = 0;
		for (let edge of this.root)
			edge.wavefront = null;
		this.root = null;
		this.processor.removeWavefront(this);
	}

	nextEvents() {
		var events = [],
			time = infinity,
			maxtime = -infinity;

		var wavefront = this;
		function testEvent(event) {
			let eventTime = event.time;
			if (eventTime < wavefront.time)
				throw "Time machine?";
			if (eventTime < time) {
				//console.log("testing", event.description(), "<", time);
				let old = events;
				events = [event];
				maxtime = time = eventTime;
				for (let i = 0; i < old.length; i++)
					testEvent(old[i]);
			} else if (eventTime < infinity && roughlyEqual(eventTime, time, TIME_EPSILON)) {
				//console.log("testing", event.description(), "<", "~" + time);
				events.push(event);
				maxtime = max(maxtime, eventTime);
			} else {
				//console.log("testing", event.description(), "skipped");
				return false;
			}
			return true;
		}

		let edge = this.root;
		while(true) {
			testEvent(edge.collapseEvent);
			let vertexEvents = edge.start.events;
			for (let i = 0; i < vertexEvents.length; i++)
				testEvent(vertexEvents[i]);

			edge = edge.next;
			if (edge === this.root) break;
		}

		if (time === infinity)
			maxtime = infinity;

		events.sort((a, b) => b - a);
		return {"time": maxtime, "events": events};
	}

	move(time) {
		let delta = time - this.time;
		let edge = this.root;
		while(true) {
			edge.start.move(delta);
			edge = edge.next;
			if (edge === this.root) break;
		}
		this.time = time;
	}

	toPath() {
		var pather = new Pather();
		pather.moveTo(vec2.clone(this.root.start.position));
		for (let edge of this.root)
			pather.lineTo(vec2.clone(edge.end.position));
		return pather.path;
	}

	draw(context) {
		if (!this.root) return;
		var dimmer = context.clone();
		dimmer.alpha = 0.2;
		for (let edge of this.root) {
			edge.draw(context);
			//LineSegment.project(edge.start.position, edge.start.direction, edge.start.speed / 10).draw(dimmer);
			new Ray(edge.segment.midpoint, edge.direction).draw(dimmer);
		}
	}
}
