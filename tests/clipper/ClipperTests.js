import Pather from '../../es6/helpers/Pather';
import Random from 'kinda-random';
import {Vector2 as vec2} from 'nd-linalg';
import {THICKNESS} from '../../es6/intersections/Intersections';
import LineSegment from '../../es6/primitives/LineSegment';
import Curve from '../../es6/primitives/Curve';
import Path from '../../es6/shapes/Path';
import Clipper from '../../es6/clipper/Clipper';
import assert from 'assert';

function arrow() {
	return new Pather()
		.moveTo([15, 13])
		.lineTo([75, 25])
		.lineTo([40, 30])
		.lineTo([45, 65])
		.close()
		.scale(1 / 75);
}

function blob() {
	return new Pather()
		.moveTo([50, 45])
		.lineTo([30, 55])
		.lineTo([10, 40])
		.lineTo([15, 35])
		.lineTo([ 0, 20])
		.lineTo([30, 23])
		.lineTo([25, 10])
		.lineTo([55,  0])
		.close()
		.scale(1 / 75);
}

function dCurve1() {
	return new Pather()
		.moveTo([25, 0])
		.curveTo([25, 75], [1, 0])
		.close()
		.scale(1 / 75);
}

function dCurve2() {
	return new Pather()
		.moveTo([50, 0])
		.lineTo([50, 75])
		.curveTo([50, 0], [-1, 0])
		.scale(1 / 75);
}

function box() {
	return new Pather()
		.lineTo([1, 0])
		.lineTo([1, 1])
		.lineTo([0, 1])
		.close();
}

function diamond() {
	return new Pather()
		.moveTo([0.5, 0])
		.lineTo([1, 0.5])
		.lineTo([0.5, 1])
		.lineTo([0, 0.5])
		.close();
}

function uShape() {
	return new Pather()
		.lineTo([0.25, 0])
		.lineTo([0.25, 0.75])
		.lineTo([0.75, 0.75])
		.lineTo([0.75, 0])
		.lineTo([1, 0])
		.lineTo([1, 1])
		.lineTo([0, 1])
		.close();
}

function triangleUp() {
	return new Pather()
		.moveTo([-0.125, 0.5])
		.lineTo([0.5, -0.125])
		.lineTo([1.125, 0.5])
		.close();
}

function lensShape() {
	return new Pather()
		.moveTo([-0.125, 0.5])
		.curveTo([1.125, 0.5], [1, -1])
		.close();
}

function box() {
	return new Pather()
		.lineTo([1, 0])
		.lineTo([1, 1])
		.lineTo([0, 1])
		.close();
}

function slightlySmallTriangle() {
	return new Pather()
		.moveTo([0.25, THICKNESS/2])
		.lineTo([0.5, 1 - THICKNESS/2])
		.lineTo([1 - THICKNESS/2, THICKNESS/2])
		.close();
}

function threeQuarterTorus() {
	return new Pather()
		.curveTo([1, -1], [0, 1])
		.lineTo([1, -0.5])
		.curveTo([0.5, 0], [1, 0])
		.close();
}

function quarterTorus() {
	return new Pather()
		.moveTo([2, 0])
		.curveTo([1, -1], [0, -1])
		.lineTo([1, -0.5])
		.curveTo([1.5, 0], [1, 0])
		.close();
}

function quarterTorus2() {
	return new Pather()
		.moveTo([1, 1])
		.curveTo([2, 0], [1, 0])
		.lineTo([1.5, 0])
		.curveTo([1, 0.5], [0, 1])
		.close();
}

function paperFig15Subject() {
	return new Pather()
		.lineTo([0, -0.5])
		.lineTo([1, -1])
		.lineTo([1, -0])
		.close();
}

function paperFig15Clip() {
	return new Pather()
		.moveTo([0.3, -1])
		.lineTo([1, -1])
		.lineTo([1.4, -0.3])
		.lineTo([0.75, -0.3])
		.lineTo([0.75, 0.2])
		.lineTo([0.5, -0])
		.lineTo([0.25, -0])
		.lineTo([0.25, -0.2])
		.lineTo([0, -0.3])
		.lineTo([0.25, -0.4])
		.lineTo([0.25, -0.625])
		.lineTo([0.75, -0.875])
		.close();
}

function drawClipping(subject, clip, paths) {
	return [{colour: "#AAF", visuals: [subject]},
			{colour: "#FAA", visuals: [clip]}]
			.concat(paths)
			.concat(function(context) {
					context.font = "8px sans-serif";
					context.fillStyle = "black";
					for (let path of paths) {
						for (let i = 0; i < path.segments.length; i++) {
							context.text(i, path.segments[i].midpoint);
						}
					}
			});
}

function isContiguous(paths) {
	for (var i = 0; i < paths.length; i++) {
		assert(paths[i].isClosed, "isClosed" + i);
		assert(paths[i].isContiguous, "isContiguous" + i);
	}
}

var tests = [
	{
		name: "polygon union",
		draw: drawClipping,
		setup: function() {
			return [arrow(), blob(), "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "polygon difference",
		draw: drawClipping,
		setup: function() {
			return [arrow(), blob(), "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 3);
			isContiguous(paths);
		}
	},
	{
		name: "polygon intersection",
		draw: drawClipping,
		setup: function() {
			return [arrow(), blob(), "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "polygon not",
		draw: drawClipping,
		setup: function() {
			return [arrow(), blob(), "not"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 3);
			isContiguous(paths);
		}
	},
	{
		name: "shape union",
		draw: drawClipping,
		setup: function() {
			return [dCurve1(), dCurve2(), "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "shape difference",
		draw: drawClipping,
		setup: function() {
			return [dCurve1(), dCurve2(), "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 3);
			isContiguous(paths);
		}
	},
	{
		name: "shape intersection",
		draw: drawClipping,
		setup: function() {
			return [dCurve1(), dCurve2(), "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "ON-IN-ON intersection",
		draw: drawClipping,
		setup: function() {
			var path1 = new Pather()
				.moveTo([0, 0.25])
				.lineTo([1, 0.25])
				.curveTo([1, 0.75], [-1, 0])
				.lineTo([0, 0.75])
				.close();
			var path2 = new Pather()
				.moveTo([0.25, 0])
				.lineTo([1, 0])
				.lineTo([1, 1])
				.lineTo([0.25, 1])
				.close();
			return [path1, path2, "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "ON-IN-ON not",
		draw: drawClipping,
		setup: function() {
			var path1 = new Pather()
				.moveTo([0, 0.25])
				.lineTo([1, 0.25])
				.curveTo([1, 0.75], [-1, 0])
				.lineTo([0, 0.75])
				.close();
			var path2 = new Pather()
				.moveTo([0.25, 0])
				.lineTo([1, 0])
				.lineTo([1, 1])
				.lineTo([0.25, 1])
				.close();
			return [path1, path2, "not"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 3);
			isContiguous(paths);
		}
	},
	{
		name: "ON-IN-ON union",
		draw: drawClipping,
		setup: function() {
			var path1 = new Pather()
				.moveTo([0, 0.25])
				.lineTo([1, 0.25])
				.curveTo([1, 0.75], [-1, 0])
				.lineTo([0, 0.75])
				.close();
			var path2 = new Pather()
				.moveTo([0.25, 0])
				.lineTo([1, 0])
				.lineTo([1, 1])
				.lineTo([0.25, 1])
				.close();
			return [path1, path2, "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "ON-OUT-ON intersection",
		draw: drawClipping,
		setup: function() {
			var path1 = new Pather()
				.moveTo([0, 0.25])
				.lineTo([1, 0.25])
				.curveTo([1, 0.75], [1, 0])
				.lineTo([0, 0.75])
				.close();
			var path2 = new Pather()
				.moveTo([0.25, 0])
				.lineTo([1, 0])
				.lineTo([1, 1])
				.lineTo([0.25, 1])
				.close();
			return [path1, path2, "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "ON-OUT-ON union",
		draw: drawClipping,
		setup: function() {
			var path1 = new Pather()
				.moveTo([0, 0.25])
				.lineTo([1, 0.25])
				.curveTo([1, 0.75], [1, 0])
				.lineTo([0, 0.75])
				.close();
			var path2 = new Pather()
				.moveTo([0.25, 0])
				.lineTo([1, 0])
				.lineTo([1, 1])
				.lineTo([0.25, 1])
				.close();
			return [path1, path2, "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "more than two intersection on one segment I",
		draw: drawClipping,
		setup: function() {
			return [uShape(), triangleUp(), "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 2);
			isContiguous(paths);
		}
	},
	{
		name: "more than two intersection on one segment II",
		draw: drawClipping,
		setup: function() {
			return [uShape(), lensShape(), "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 2);
			isContiguous(paths);
		}
	},

	{
		name: "degenerate box() clipped by diamond() intersection",
		draw: function() {
			return [];
		},
		setup: function() {
			return [box(), diamond(), "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
		}
	},
	{
		name: "degenerate box() clipped by diamond() union",
		draw: function() {
			return [];
		},
		setup: function() {
			return [box(), diamond(), "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate box() clipped by diamond() difference",
		draw: function() {
			return [];
		},
		setup: function() {
			return [box(), diamond(), "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 4);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate diamond() clipped by box() intersection",
		draw: function() {
			return [];
		},
		setup: function() {
			return [diamond(), box(), "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate diamond() clipped by box() union",
		draw: function() {
			return [];
		},
		setup: function() {
			return [diamond(), box(), "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate diamond() clipped by box() difference",
		draw: function() {
			return [];
		},
		setup: function() {
			return [diamond(), box(), "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 0);
			isContiguous(paths);
		}
	},

	{
		name: "degenerate box() one shared vertex intersection",
		draw: drawClipping,
		setup: function() {
			var box = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 0.5])
				.lineTo([0.5, 0])
				.close();
			var blob = new Pather()
				.lineTo([1, 0.5])
				.lineTo([0.5, 1])
				.close();
			return [box, blob, "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate box() one shared vertex union",
		draw: drawClipping,
		setup: function() {
			var box = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 0.5])
				.lineTo([0.5, 0])
				.close();
			var blob = new Pather()
				.lineTo([1, 0.5])
				.lineTo([0.5, 1])
				.close();
			return [box, blob, "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate box() one shared vertex difference",
		draw: drawClipping,
		setup: function() {
			var box = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 0.5])
				.lineTo([0.5, 0])
				.close();
			var blob = new Pather()
				.lineTo([1, 0.5])
				.lineTo([0.5, 1])
				.close();
			return [box, blob, "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 2);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate box() two shared vertex intersection",
		draw: drawClipping,
		setup: function() {
			var box = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 0.5])
				.lineTo([0.5, 0])
				.close();
			var blob = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 1])
				.lineTo([1, 0.5])
				.close();
			return [box, blob, "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate box() two shared vertex union",
		draw: drawClipping,
		setup: function() {
			var box = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 0.5])
				.lineTo([0.5, 0])
				.close();
			var blob = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 1])
				.lineTo([1, 0.5])
				.close();
			return [box, blob, "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate box() two shared vertex difference",
		draw: drawClipping,
		setup: function() {
			var box = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 0.5])
				.lineTo([0.5, 0])
				.close();
			var blob = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 1])
				.lineTo([1, 0.5])
				.close();
			return [box, blob, "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate box() three shared vertex intersection",
		draw: drawClipping,
		setup: function() {
			var box = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 0.5])
				.lineTo([0.5, 0])
				.close();
			var blob = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 1])
				.lineTo([1, 0.5])
				.lineTo([0.5, 0])
				.close();
			return [box, blob, "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate box() three shared vertex union",
		draw: drawClipping,
		setup: function() {
			var box = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 0.5])
				.lineTo([0.5, 0])
				.close();
			var blob = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 1])
				.lineTo([1, 0.5])
				.lineTo([0.5, 0])
				.close();
			return [box, blob, "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "degenerate box() four shared vertex intersection",
		draw: drawClipping,
		setup: function() {
			var box = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 0.5])
				.lineTo([0.5, 0])
				.close();
			return [box, box, "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
		}
	}, {
		name: "degenerate box() four shared vertex difference",
		draw: drawClipping,
		setup: function() {
			var box = new Pather()
				.lineTo([0, 0.5])
				.lineTo([0.5, 0.5])
				.lineTo([0.5, 0])
				.close();
			return [box, box, "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 0);
		}
	},
	{
		name: "overlapping boxes intersection",
		draw: drawClipping,
		setup: function() {
			var box1 = new Pather()
				.lineTo([0, 1])
				.lineTo([0.75, 1])
				.lineTo([0.75, 0])
				.close();
			var box2 = new Pather()
				.moveTo([1, 0])
				.lineTo([1, 1])
				.lineTo([0.25, 1])
				.lineTo([0.25, 0])
				.close();
			return [box1, box2, "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "overlapping boxes union",
		draw: drawClipping,
		setup: function() {
			var box1 = new Pather()
				.lineTo([0, 1])
				.lineTo([0.75, 1])
				.lineTo([0.75, 0])
				.close();
			var box2 = new Pather()
				.moveTo([1, 0])
				.lineTo([1, 1])
				.lineTo([0.25, 1])
				.lineTo([0.25, 0])
				.close();
			return [box1, box2, "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "overlapping boxes not",
		draw: drawClipping,
		setup: function() {
			var box1 = new Pather()
				.lineTo([0, 1])
				.lineTo([0.75, 1])
				.lineTo([0.75, 0])
				.close();
			var box2 = new Pather()
				.moveTo([1, 0])
				.lineTo([1, 1])
				.lineTo([0.25, 1])
				.lineTo([0.25, 0])
				.close();
			return [box1, box2, "not"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "adjacent boxes union",
		draw: drawClipping,
		setup: function() {
			var box1 = new Pather()
				.lineTo([0.5, 0])
				.lineTo([0.5, 1])
				.lineTo([0, 1])
				.close();
			var box2 = new Pather()
				.moveTo([0.5, 0])
				.lineTo([1, 0])
				.lineTo([1, 1])
				.lineTo([0.5, 1])
				.close();
			return [box1, box2, "union"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "thick polygon difference",
		draw: drawClipping,
		setup: function() {
			return [box(), slightlySmallTriangle(), "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 2);
			isContiguous(paths);
		}
	},
	{
		name: "thick shape difference I",
		draw: drawClipping,
		setup: function() {
			return [threeQuarterTorus(), slightlySmallTriangle(), "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 2);
			isContiguous(paths);
		}
	},
	{
		name: "thick shape difference II",
		draw: drawClipping,
		setup: function() {
			return [threeQuarterTorus(), quarterTorus(), "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "thick shape difference III",
		draw: drawClipping,
		setup: function() {
			return [threeQuarterTorus(), quarterTorus2(), "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 2);
			isContiguous(paths);
		}
	},
	{
		name: "paper fig 15",
		draw: drawClipping,
		setup: function() {
			return [paperFig15Subject(), paperFig15Clip(), "intersection"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 1);
			isContiguous(paths);
		}
	},
	{
		name: "paper fig 16",
		draw: drawClipping,
		setup: function() {
			return [paperFig15Subject(), paperFig15Clip(), "difference"];
		},
		assert: function(subject, clip, paths) {
			assert.equal(paths.length, 3);
			isContiguous(paths);
		}
	},
];

let accurateTests = tests.map(({name, draw, assert, setup}) => {
	let setupResult = setup();
	return {
		name, draw, assert,
			setup: () => [setupResult[0], setupResult[1], Clipper[setupResult[2]](setupResult[0], setupResult[1])]
	};
});

function randomOffset (random) {
	return vec2(random.get() * 0.5 * THICKNESS, random.get() * 0.5 * THICKNESS);
}

function deformShape (shape, random) {
	let newSegmentPositions = shape.segments.map(s => vec2.add(vec2(0, 0), s.start, randomOffset(random)));
	let newSegmentDirections = shape.segments.map(s => s.direction);
	let newSegments = [];

	for (let i = 0; i < newSegmentPositions.length; i++) {
		newSegments.push(
			shape.segments[i].isCurve
				? new Curve(
					newSegmentPositions[i],
					newSegmentDirections[i],
					newSegmentPositions[(i + 1) % newSegmentPositions.length])
				: new LineSegment(
					newSegmentPositions[i],
					newSegmentPositions[(i + 1) % newSegmentPositions.length])
		);
	}

	return new Path(newSegments);
}

let inaccurateTests = () => {
	let seed = Math.floor(Math.random() * 100000000);
	let random = new Random(seed);
	console.log("SEED " + seed);
	return tests.map(({name, draw, assert, setup}) => {
		let setupResult = setup();
		setupResult[0] = deformShape(setupResult[0], random);
		setupResult[1] = deformShape(setupResult[1], random);
		return {
			name, draw, assert,
			setup: () => [setupResult[0], setupResult[1], Clipper[setupResult[2]](setupResult[0], setupResult[1])]
		};
	});
}

Object.defineProperties(exports, {
	name: {value: "clipper tests"},
	tests: {value: inaccurateTests()}
});
