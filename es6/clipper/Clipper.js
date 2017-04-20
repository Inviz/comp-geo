/*

    This module implements polygon clippings, inspired by:

 An Extension of Polygon Clipping To Resolve Degenerate Cases
 ============================================================

                              by

                 Dae Hyun Kim & Myoung-Jun Kim

            (a paper that I paid fucking 42EUR for)

 */

import Chain from '../datastructures/Chain';
import intersect, {THICKNESS} from '../intersections/Intersections';
import {roughlyEqual, mapPush} from '../missing-stuff';
import {Vector2 as vec2} from '../nd-linalg/vector2';
import It from '../iteratorers';
import Path from '../shapes/Path';
import Drawing2D from '../drawing/Drawing2D';

const DEBUG = false;

const Modes = {
	INTERSECTION: Symbol("intersection"),
	UNION: Symbol("union"),
	DIFFERENCE: Symbol("difference"),
	NOT: Symbol("not")
};

module.exports = {
	intersection: clip.bind(null, Modes.INTERSECTION),
	union: clip.bind(null, Modes.UNION),
	difference: clip.bind(null, Modes.DIFFERENCE),
	not: clip.bind(null, Modes.NOT)
};

const Locations = {
	INSIDE: Symbol("inside"),
	OUTSIDE: Symbol("outside"),
	ON_EDGE: Symbol("on edge")
};

const Roles = {
	ENTRY: Symbol("entry"),
	EXIT: Symbol("exit"),
	ENTRY_EXIT: Symbol("entry/exit"),
	EXIT_ENTRY: Symbol("exit/entry")
};

const Directions = {
	FORWARD_STAY: Symbol("forward & stay"),
	FORWARD_SWITCH: Symbol("forward & switch"),
	BACKWARD_STAY: Symbol("backward & stay"),
	BACKWARD_SWITCH: Symbol("backward & switch")
};

class ClipperVertex extends Chain {
	constructor (segment) {
		super();
		this.forwardEdge = segment;
		this.forwardEdgeLocation = null;
		this.location = null;
		this.role = null;
		this.visited = false;
		this.neighbor = null;
		this.partnerVertex = null;
		this.isFirstPartner = false;
	}

	get position () {return this.forwardEdge.start;}
	get isIntersection () {return this.neighbor && this.role;}
	get isEntry () {return this.role === Roles.ENTRY || this.role === Roles.ENTRY_EXIT;}
	get isExit () {return this.role === Roles.EXIT || this.role === Roles.EXIT_ENTRY;}
	get backwardEdge () {return this.previous.forwardEdge;}
	get backwardEdgeLocation () {return this.previous.forwardEdgeLocation;}

	toPath () {
		return new Path([...(this.values())].map((vertex) => vertex.forwardEdge));
	}

	split (position) {
		let parts = this.forwardEdge.subdivide(position);
		this.forwardEdge = parts[0];
		let newVertex = new ClipperVertex(parts[1]);

		newVertex.next = this.next;
		this.next.previous = newVertex;
		newVertex.previous = this;
		this.next = newVertex;

		return newVertex;
	}

	* values () {for (let vertex of this) yield vertex;}

}

/* MAIN FUNCTION */

function clip (mode, subjectPath, clipPath) {
	if (subjectPath.isClockwise) subjectPath = subjectPath.reverse();
	if (clipPath.isClockwise) clipPath = clipPath.reverse();

	let subjectChain = createVertexChain(subjectPath, clipPath);
	let clipChain = createVertexChain(clipPath, subjectPath);

	let [subjectIntersectionGroups, clipIntersectionGroups] = findIntersections(
		subjectChain, clipChain
	);

	[subjectChain, clipChain] = splitAtIntersections(
		subjectChain, clipChain, subjectIntersectionGroups, clipIntersectionGroups
	);

	DEBUG && debugIntersections(subjectChain, clipChain);

	[subjectChain, clipChain] = determineEdgeLocations(
		subjectChain, clipChain, subjectPath, clipPath
	);

	// special case: shapes are exactly on top of each other
	let allEdgesOnEdge = true;
	for (let vertex of subjectChain) if (vertex.forwardEdgeLocation !== Locations.ON_EDGE) {
		allEdgesOnEdge = false;
		break;
	}

	if (allEdgesOnEdge) {
		if (mode === Modes.UNION || mode === Modes.INTERSECTION) {
			return [subjectChain.toPath()];
		} else {
			return [];
		}
	}

	DEBUG && debugLocations(subjectChain, clipChain);

	[subjectChain, clipChain] = setRoles(subjectChain, clipChain);

	DEBUG && debugRoles(subjectChain, clipChain);

	[subjectChain, clipChain] = markCouples(subjectChain, clipChain);

	let reversed;

	if (mode === Modes.UNION || mode === Modes.DIFFERENCE) {
		DEBUG && console.log("reverse subject");
		reverseRoles(subjectChain);
		reversed = true;
	}
	if (mode === Modes.UNION || mode === Modes.NOT) {
		DEBUG && console.log("reverse clip");
		reverseRoles(clipChain);
		reversed = true;
	}

	if (DEBUG && reversed) debugRoles(subjectChain, clipChain);

	let resultPolygons = traverse(subjectChain, clipChain, mode);

	return resultPolygons.map(polygon => polygon.weld(THICKNESS));
}

function createVertexChain (path, otherPath) {
	if (!path.isClosed) throw "A path must be closed to become a shape";

	let firstVertex;
	let vertex;

	for (let segment of path.segments) {
		let previous = vertex;
		vertex = new ClipperVertex(segment);
		vertex.location = otherPath.containsPoint(vertex.position)
			? Locations.INSIDE
			: Locations.OUTSIDE;

		if (previous) Chain.connect(previous, vertex);
		else firstVertex = vertex;
	}

	Chain.connect(vertex, firstVertex);
	return firstVertex;
}

function findIntersections (subjectChain, clipChain) {
	let subjectIntersectionGroups = new Map();
	let clipIntersectionGroups = new Map();

	for (let subjectVertex of subjectChain)
		for (let clipVertex of clipChain) {
			let intersections = intersect(subjectVertex.forwardEdge, clipVertex.forwardEdge);
			DEBUG && console.log(subjectVertex.id, clipVertex.id);
			for (let intersection of intersections) {
				DEBUG && console.log(intersection);
				if (!roughlyEqual(intersection.u, 1) && !roughlyEqual(intersection.v, 1)) {
					let intersectionInfo = {
						position: intersection.p,
						u: intersection.u, v: intersection.v,
						subjectVertex, clipVertex
					};
					mapPush(subjectIntersectionGroups, subjectVertex, intersectionInfo);
					mapPush(clipIntersectionGroups, clipVertex, intersectionInfo);
				}
			}
		}

	return [subjectIntersectionGroups, clipIntersectionGroups];
}

function splitAtIntersections (subjectChain, clipChain, subjectIntersectionGroups, clipIntersectionGroups) {
	for (let intersectionGroup of subjectIntersectionGroups.values()) {
		const sorted = Array.from( subjectIntersectionGroups.values() ).sort((a, b) => a.u > b.u);
		let latestSubjectVertex = sorted[0].subjectVertex;

		console.log(sorted);
		for (let intersectionInfo of sorted) {
			console.log(intersectionInfo );
			let subjectVertex = latestSubjectVertex;
			let newSubjectVertex;

			// if (vec2.dist(intersectionInfo.position, subjectVertex.position) < THICKNESS)
			// 	newSubjectVertex = subjectVertex;
			// else if (vec2.dist(intersectionInfo.position, subjectVertex.next.position) < THICKNESS)
			// 	newSubjectVertex = subjectVertex.next;
			// else {
			// 	newSubjectVertex = subjectVertex.split(intersectionInfo.position);
			// }

			intersectionInfo.subjectVertex = newSubjectVertex;
			latestSubjectVertex = newSubjectVertex;
		}
	}

	for (let intersectionGroup of clipIntersectionGroups.values()) {
		const sorted = Array.from( subjectIntersectionGroups.values() ).sort((a, b) => a.v > b.v);
		// intersectionGroup.sort((a, b) => a.v > b.v);
		let latestClipVertex = sorted[0].clipVertex;

		for (let intersectionInfo of sorted) {
			let clipVertex = latestClipVertex;
			let newClipVertex;

			if (vec2.dist(intersectionInfo.position, clipVertex.position) < THICKNESS)
				newClipVertex = clipVertex;
			else if (vec2.dist(intersectionInfo.position, clipVertex.next.position) < THICKNESS)
				newClipVertex = clipVertex.next;
			else {
				newClipVertex = clipVertex.split(intersectionInfo.position);
			}

			let subjectVertex = intersectionInfo.subjectVertex;
			subjectVertex.location = newClipVertex.location = Locations.ON_EDGE;
			subjectVertex.neighbor = newClipVertex;
			newClipVertex.neighbor = subjectVertex;
			latestClipVertex = newClipVertex;
		}
	}

	return [subjectChain, clipChain];
}

function modifyLocations (chain, mode) {
	for (let vertex of chain) {
		if (mode === Modes.UNION) vertex.location = Locations.INSIDE;
	}
}

function determineEdgeLocations (subjectChain, clipChain, subjectPath, clipPath) {
	for (let subjectVertex of subjectChain)
		subjectVertex.forwardEdgeLocation = determineSingleEdgeLocation(subjectVertex, clipPath);
	for (let clipVertex of clipChain)
		clipVertex.forwardEdgeLocation = determineSingleEdgeLocation(clipVertex, subjectPath);
	return [subjectChain, clipChain];
}

function determineSingleEdgeLocation (vertex, testPath) {
	let current = vertex.location;
	let next = vertex.next.location;

	if (current === Locations.OUTSIDE || next === Locations.OUTSIDE) return Locations.OUTSIDE;
	if (current === Locations.INSIDE || next === Locations.INSIDE) return Locations.INSIDE;
	if (current === Locations.ON_EDGE && next === Locations.ON_EDGE) {
		// this case can be optimized in some cases by looking at start & end neighbors (see paper)
		let midpoint = vertex.forwardEdge.midpoint;
		if (testPath.containsPoint(midpoint)
		|| vec2.dist(testPath.closestPointTo(midpoint), midpoint) < THICKNESS) {
			if (vec2.dist(midpoint, testPath.closestPointTo(midpoint)) < THICKNESS)
				return Locations.ON_EDGE;
			else return Locations.INSIDE;
		} else return Locations.OUTSIDE;
	}
	throw "Invalid IN-OUT or OUT-IN without intersection";
}

const roleFromEdgeLocations = {
	[Locations.ON_EDGE]: {
		[Locations.ON_EDGE]: null,
		[Locations.OUTSIDE]: Roles.EXIT,
		[Locations.INSIDE]:  Roles.ENTRY
	},
	[Locations.OUTSIDE]: {
		[Locations.ON_EDGE]: Roles.ENTRY,
		[Locations.OUTSIDE]: Roles.ENTRY_EXIT,
		[Locations.INSIDE]:  Roles.ENTRY
	},
	[Locations.INSIDE]: {
		[Locations.ON_EDGE]: Roles.EXIT,
		[Locations.OUTSIDE]: Roles.EXIT,
		[Locations.INSIDE]:  Roles.EXIT_ENTRY
	}
};

function setRoles (subjectChain, clipChain) {
	for (let subjectVertex of subjectChain)
		if (subjectVertex.neighbor) {
			subjectVertex.role = roleFromEdgeLocations
				[subjectVertex.backwardEdgeLocation][subjectVertex.forwardEdgeLocation];
			// vertex has become meaningless, make sure it doesn't look like an intersection
			// at all anymore, so we can distinguish it from visited intersections later
			if (!subjectVertex.role) subjectVertex.neighbor = null;
		}
	for (let clipVertex of clipChain)
		if (clipVertex.neighbor) {
			clipVertex.role = roleFromEdgeLocations
				[clipVertex.backwardEdgeLocation][clipVertex.forwardEdgeLocation];
			// vertex has become meaningless, make sure it doesn't look like an intersection
			// at all anymore, so we can distinguish it from visited intersections later
			if (!clipVertex.role) clipVertex.neighbor = null;
		}
	return [subjectChain, clipChain];
}

function reverseRoles (chain) {
	for (let vertex of chain) {
		switch (vertex.role) {
			case Roles.ENTRY: vertex.role = Roles.EXIT; break;
			case Roles.EXIT: vertex.role = Roles.ENTRY; break;
			case Roles.ENTRY_EXIT: vertex.role = Roles.EXIT_ENTRY; break;
			case Roles.EXIT_ENTRY: vertex.role = Roles.ENTRY_EXIT; break;
		}
	}
}

function markCouples (subjectChain, clipChain) {
	for (let chain of [subjectChain, clipChain]) {
		let previousIntersectionVertex;

		for (let vertex of It.concat(chain, chain)()) {
			if (vertex.isIntersection) {
				if (previousIntersectionVertex) {
					if ((vertex.role === Roles.ENTRY || vertex.role === Roles.EXIT)
					&& vertex.role === previousIntersectionVertex.role) {
						vertex.partnerVertex = previousIntersectionVertex;
						previousIntersectionVertex.partnerVertex = vertex;
						previousIntersectionVertex.firstParter = true;
					}
				}
				previousIntersectionVertex = vertex;
			}
		}
	}

	return [subjectChain, clipChain];
}

function traverse (subjectChain, clipChain) {
	let resultPolygons = [];

	while (true) {
		let startVertex = findStartVertex(subjectChain, clipChain);
		if (!startVertex) return resultPolygons;

		let currentResultPolygonEdges = [];
		let direction = Directions.FORWARD_SWITCH; // D4 should be started with if polys are CW
		direction = deleteAndGetNextDirection(startVertex, startVertex, direction);

		let previousIntersectionVertex = startVertex;
		DEBUG && debugTraversal(subjectChain, clipChain, true, startVertex, currentResultPolygonEdges, "start");
		let currentVertex = proceed(startVertex, direction, currentResultPolygonEdges);

		while (currentVertex !== startVertex && !(currentVertex.neighbor && !currentVertex.role)) {
			DEBUG && debugTraversal(subjectChain, clipChain, [...subjectChain].contains(currentVertex), currentVertex, currentResultPolygonEdges, "step " + direction.toString());
			if (currentVertex.isIntersection) {
				direction = deleteAndGetNextDirection(currentVertex, previousIntersectionVertex, direction);
				previousIntersectionVertex = currentVertex;
			}
			currentVertex = proceed(currentVertex, direction, currentResultPolygonEdges);
		}

		DEBUG && debugTraversal(subjectChain, clipChain, [...subjectChain].contains(currentVertex), currentVertex, currentResultPolygonEdges, "done");

		if (currentResultPolygonEdges.length > 2 || currentResultPolygonEdges.some(edge => edge.isCurve))
			resultPolygons.push(new Path(currentResultPolygonEdges));
	}
}

function deleteAndGetNextDirection (currentVertex, previousIntersectionVertex, direction) {
	switch (direction) {
		// COMING FROM THE SAME CHAIN
		case Directions.FORWARD_STAY:
		case Directions.BACKWARD_STAY:
			switch (currentVertex.role) {
				case Roles.ENTRY_EXIT:
					if (direction === Directions.FORWARD_STAY) {
						currentVertex.role = Roles.EXIT;
						return Directions.FORWARD_SWITCH;
					} else {
						currentVertex.role = Roles.ENTRY;
						return Directions.BACKWARD_SWITCH;
					} break;
				case Roles.EXIT_ENTRY:
					if (direction === Directions.FORWARD_STAY) {
						currentVertex.role = Roles.ENTRY;
						return Directions.FORWARD_SWITCH;
					} else {
						currentVertex.role = Roles.EXIT;
						return Directions.BACKWARD_SWITCH;
					} break;
				case Roles.ENTRY:
					currentVertex.role = null;
					if (direction === Directions.FORWARD_STAY
					&& currentVertex.partnerVertex && previousIntersectionVertex.partnerVertex === currentVertex)
						return Directions.FORWARD_STAY;
					else return direction === Directions.FORWARD_STAY
						? Directions.FORWARD_SWITCH
						: Directions.BACKWARD_SWITCH;
					break;
				case Roles.EXIT:
					currentVertex.role = null;
					if (direction !== Directions.FORWARD_STAY
					&& currentVertex.partnerVertex && previousIntersectionVertex.partnerVertex === currentVertex)
						return Directions.BACKWARD_STAY;
					else return direction === Directions.FORWARD_STAY
						? Directions.FORWARD_SWITCH
						: Directions.BACKWARD_SWITCH;
			}
			break;
		// COMING FROM THE OTHER CHAIN
		default:
			switch (currentVertex.role) {
				case Roles.ENTRY_EXIT:
					currentVertex.role = null;
					return direction === Directions.FORWARD_SWITCH
						? Directions.BACKWARD_SWITCH
						: Directions.FORWARD_SWITCH;
				case Roles.EXIT_ENTRY:
					if (direction === Directions.FORWARD_SWITCH) {
						currentVertex.role = Roles.ENTRY;
						return Directions.BACKWARD_STAY;
					} else {
						currentVertex.role = Roles.EXIT;
						return Directions.FORWARD_STAY;
					}
					break;
				case Roles.ENTRY:
					currentVertex.role = null;
					return Directions.FORWARD_STAY;
				case Roles.EXIT:
					currentVertex.role = null;
					return Directions.BACKWARD_STAY;
			}
			break;
	}
}

function proceed (vertex, direction, currentResultPolygonEdges) {
	switch (direction) {
		case Directions.FORWARD_STAY:
			currentResultPolygonEdges.push(vertex.forwardEdge);
			return vertex.next;
		case Directions.BACKWARD_STAY:
			currentResultPolygonEdges.push(vertex.backwardEdge.reverse());
			return vertex.previous;
		default:
			return vertex.neighbor;
	}
}

function findStartVertex (subjectChain, clipChain) {

	for (let vertex of subjectChain) {
		if (vertex.isIntersection) {
			if (vertex.partnerVertex) {
				if (vertex.isEntry && vertex.partnerVertex.isEntry && vertex.isFirstPartner) {
					return vertex.partnerVertex;
				} else if (vertex.isExit && vertex.partnerVertex.isExit  && !vertex.isFirstPartner) {
					return vertex;
				} else {
					continue;
				}
			} else {
				return vertex;
			}
		}
	}
}

/* DEBUG DRAWS */

function debugIntersections (subjectChain, clipChain) {
	let things = [
		{colour: "#AAF", visuals: [subjectChain.toPath()]},
		{colour: "#FAA", visuals: [clipChain.toPath()]},
		{colour: "#00F", visuals: [function (context) {
			context.font = "8px sans-serif";
			for (let vertex of subjectChain)
				context.text(vertex.id, vertex.forwardEdge.midpoint);
		}]},
		{colour: "#F00", visuals: [function (context) {
			context.font = "8px sans-serif";
			context.textAlign = "right";
			for (let vertex of clipChain)
				context.text(vertex.id, vertex.forwardEdge.midpoint);
		}]}
	].concat([...subjectChain.values()]
			.map(v =>
				({colour: v.neighbor ? "#000" : "#888", visuals: [v.position]})))
	Drawing2D.log("Intersections", things);
}

const LocationDisplayNames = {
	[Locations.ON_EDGE]: "ON",
	[Locations.INSIDE]: "IN",
	[Locations.OUTSIDE]: "OUT"
};

function debugLocations (subjectChain, clipChain) {
	let things = [
		{colour: "#AAF", visuals: [subjectChain.toPath()]},
		{colour: "#FAA", visuals: [clipChain.toPath()]},
		{colour: "#00F", visuals: [function (context) {
			context.font = "8px sans-serif";
			for (let vertex of subjectChain)
				context.text(LocationDisplayNames[vertex.location], vertex.position);
		}]},
		{colour: "#F00", visuals: [function (context) {
			context.font = "8px sans-serif";
			context.textAlign = "right";
			for (let vertex of clipChain)
				context.text(LocationDisplayNames[vertex.location], vertex.position);
		}]}
	];
	Drawing2D.log("Vertex Locations", things);
	things = [
		{colour: "#AAF", visuals: [subjectChain.toPath()]},
		{colour: "#FAA", visuals: [clipChain.toPath()]},
		{colour: "#00F", visuals: [function (context) {
			context.font = "8px sans-serif";
			for (let vertex of subjectChain)
				context.text(LocationDisplayNames[vertex.forwardEdgeLocation] || "", vertex.forwardEdge.midpoint);
		}]},
		{colour: "#F00", visuals: [function (context) {
			context.font = "8px sans-serif";
			context.textAlign = "right";
			for (let vertex of clipChain)
				context.text(LocationDisplayNames[vertex.forwardEdgeLocation] || "", vertex.forwardEdge.midpoint);
		}]}
	];
	Drawing2D.log("Edge Locations", things);
}

let RoleDisplayNames = {
	[Roles.ENTRY]: "EN",
	[Roles.EXIT]: "EX",
	[Roles.ENTRY_EXIT]: "EN>EX",
	[Roles.EXIT_ENTRY]: "EX>EN"
};

function debugRoles (subjectChain, clipChain) {
	let things = [
		{colour: "#AAF", visuals: [subjectChain.toPath()]},
		{colour: "#FAA", visuals: [clipChain.toPath()]},
		{colour: "#00F", visuals: [function (context) {
			context.font = "8px sans-serif";
			for (let vertex of subjectChain)
				context.text(RoleDisplayNames[vertex.role] || "", vertex.position);
		}]},
		{colour: "#F00", visuals: [function (context) {
			context.font = "8px sans-serif";
			context.textAlign = "right";
			for (let vertex of clipChain)
				context.text(RoleDisplayNames[vertex.role] || "", vertex.position);
		}]}
	];
	Drawing2D.log("Vertex Roles", things);
}

function debugTraversal (subjectChain, clipChain, onSubject, currentVertex, resultEdges, step) {
	let things = [
		{colour: "#AAF", visuals: [subjectChain.toPath()]},
		{colour: "#FAA", visuals: [clipChain.toPath()]},
		{colour: "#00F", visuals: [function (context) {
			context.font = "8px sans-serif";
			for (let vertex of subjectChain)
				context.text(RoleDisplayNames[vertex.role] || "", vertex.position);
		}]},
		{colour: "#F00", visuals: [function (context) {
			context.font = "8px sans-serif";
			context.textAlign = "right";
			for (let vertex of clipChain)
				context.text(RoleDisplayNames[vertex.role] || "", vertex.position);
		}]},
		{colour: onSubject ? "#00F" : "#F00", visuals: [currentVertex.position]},
		{colour: "#000", visuals: [new Path(resultEdges)]}
	];

	Drawing2D.log("Traversal " + step, things);
}