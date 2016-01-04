function drawWithoutSpokes(path, skeleton) {
	return [{colour: "#AAA", visuals: [path]}].concat(skeleton.waves.map(e => e.path));
}

var tests = [
	{
		name: "straight path test",
		draw: drawWithoutSpokes,
		setup: function() {
			let path = new Path([new LineSegment(vec2(0, 0), vec2(1, 1))]);
			return [path, new Skeleton(path, 0.5, options)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.waves.length == 4);
		}
	},
	{
		name: "Z path test",
		draw: drawWithoutSpokes,
		setup: function() {
			let path = new Path([
				new LineSegment(vec2(0, 0), vec2(1, 0)),
				new LineSegment(vec2(1, 0), vec2(0, 1)),
				new LineSegment(vec2(0, 1), vec2(1, 1))]);
			return [path, new Skeleton(path, 1, options)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.waves.length == 4);
		}
	},
	{
		name: "∑ path test",
		draw: drawWithoutSpokes,
		setup: function() {
			let path = new Path([
				new LineSegment([1, 1], [0, 1]),
				new LineSegment([0, 1], [0.5, 0.5]),
				new LineSegment([0.5, 0.5], [0, 0]),
				new LineSegment([0, 0], [1, 0])
			]);
			return [path, new Skeleton(path, 1, options)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.waves.length === 2);
			for (let wave of skeleton.waves)
				assert(wave.side !== SkeletonEdge.InnerEdge);
		}
	},
	{
		name: "Ω path test",
		draw: drawWithoutSpokes,
		setup: function() {
			let path = new Pather([0, 1])
				.lineTo([0.25, 1])
				.lineTo([0, 0.5])
				.lineTo([0.5, 0])
				.lineTo([1, 0.5])
				.lineTo([0.75, 1])
				.lineTo([1, 1])
				.path;
			return [path, new Skeleton(path, 0.25, options)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.waves.length == 5);
		}
	},
	{
		name: "Ω path test cap=0.25",
		draw: drawWithoutSpokes,
		setup: function() {
			let path = new Pather([0, 1])
				.lineTo([0.25, 1])
				.lineTo([0, 0.5])
				.lineTo([0.5, 0])
				.lineTo([1, 0.5])
				.lineTo([0.75, 1])
				.lineTo([1, 1])
				.path;
			let opts = newoptions();
			opts.capWeight = 0.25;
			return [path, new Skeleton(path, 0.25, opts)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.waves.length == 3);
		}
	},
	{
		name: "Ω path test cap=0.75",
		draw: drawWithoutSpokes,
		setup: function() {
			let path = new Pather([0, 1])
				.lineTo([0.25, 1])
				.lineTo([0, 0.5])
				.lineTo([0.5, 0])
				.lineTo([1, 0.5])
				.lineTo([0.75, 1])
				.lineTo([1, 1])
				.path;
			let opts = newoptions();
			opts.capWeight = 0.75;
			return [path, new Skeleton(path, 0.25, opts)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.waves.length == 7);
		}
	},
	{
		name: "Ω path test cap=0",
		draw: drawWithoutSpokes,
		setup: function() {
			let path = new Pather([0, 1])
				.lineTo([0.25, 1])
				.lineTo([0, 0.5])
				.lineTo([0.5, 0])
				.lineTo([1, 0.5])
				.lineTo([0.75, 1])
				.lineTo([1, 1])
				.path;
			let opts = newoptions();
			opts.capWeight = 0;
			return [path, new Skeleton(path, 0.25, opts)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.waves.length == 3);
		}
	},
	{
		name: "Ω path test cap=1",
		draw: drawWithoutSpokes,
		setup: function() {
			let path = new Pather([0, 1])
				.lineTo([0.25, 1])
				.lineTo([0, 0.5])
				.lineTo([0.5, 0])
				.lineTo([1, 0.5])
				.lineTo([0.75, 1])
				.lineTo([1, 1])
				.path;
			let opts = newoptions();
			opts.capWeight = 1;
			return [path, new Skeleton(path, 0.25, opts)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.waves.length == 7);
		}
	}
];

var DebugOptions = false;
for (let test of tests) {
	if (test.only === true) {
		DebugOptions = true;
		break;
	}
}

function newoptions() {
	if (DebugOptions) {
		return {
			DEBUG: true,
			DEBUG_DRAW_INITIAL: true,
			DEBUG_DRAW_INITIAL_EVENTS: false,
			DEBUG_DRAW_SKIPPED_EVENTS: true,
			DEBUG_DRAW_STEPS: true,
			DEBUG_DRAW_MOVE: true,
			DEBUG_DRAW_OBTUSE_EVENTS_EACH_STEP: false
		};
	}
	return {};
}

var options = newoptions();

Object.defineProperties(exports, {
	name: {value: "skeleton open path tests"},
	tests: {value: tests}
});
