function draw(path, skeleton) {
	function drawspokes(context) {
		let min = 0.1, max = 0;
		for (let spoke of skeleton.spokes)
			max = Math.max(max, spoke.end[2]);

		for (let spoke of skeleton.spokes) {
			let style = new Drawing2DLinearGradient(spoke.start, spoke.end),
				start = (spoke.start[2] / max) / (1 - min) + min,
				end = (spoke.end[2] / max) / (1 - min) + min;
			style.addColorStop(0, `rgba(255, 0, 255, ${start})`);
			style.addColorStop(1, `rgba(255, 0, 255, ${end})`);
			context.style = style;
			spoke.draw(context);
		}
	}

	return [{colour: "#AAA", visuals: [path]}, drawspokes].concat(skeleton.waves.map(e => e.path));
}

var RunStressTest = false;
var seed = 0;
var numberOfEdges = RunStressTest ? 15 : 50;

//seed = 8173838342671996;
//seed = 4149836918388686;
//seed = 4413312592155855;
//seed = 3778586571241709;
//seed = 6414226216441014;
var RunRandomOnly = seed > 0;
RunStressTest = RunStressTest && (seed === 0);

if (!RunRandomOnly) {
	seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
	console.log("SkeletonTests random seed", seed);
}

//RunRandomOnly = true;

function convex() {
	return new Pather([0, 0.25])
		.lineTo([0.1, 0])
		.lineTo([0.7, 0.15])
		.lineTo([1, 0.6])
		.lineTo([0.75, 0.75])
		.lineTo([0.55, 0.8])
		.lineTo([0.25, 0.85])
		.close();
}

function concave() {
	return new Pather([0, 0.25])
		.lineTo([0.1, 0])
		.lineTo([0.7, 0.15])
		.lineTo([1, 0.6])
		.lineTo([0.75, 0.75])
		.lineTo([0.55, 0.6])
		.lineTo([0.25, 0.85])
		.close();
}

function square() {
	return new Pather()
		.lineTo([1, 0])
		.lineTo([1, 1])
		.lineTo([0, 1])
		.close();
}

function box() {
	return new Pather([0.25, 0])
		.lineTo([0.75, 0])
		.lineTo([0.75, 1])
		.lineTo([0.25, 1])
		.close();
}

function plus() {
	return new Pather([0, 1 / 3])
		.lineTo([1 / 3, 1 / 3])
		.lineTo([1 / 3, 0])
		.lineTo([2 / 3, 0])
		.lineTo([2 / 3, 1 / 3])
		.lineTo([1, 1 / 3])
		.lineTo([1, 2 / 3])
		.lineTo([2 / 3, 2 / 3])
		.lineTo([2 / 3, 1])
		.lineTo([1 / 3, 1])
		.lineTo([1 / 3, 2 / 3])
		.lineTo([0, 2 / 3])
		.close();
}

function l() {
	return new Pather()
		.lineTo([0.5, 0])
		.lineTo([0.5, 0.5])
		.lineTo([1, 0.5])
		.lineTo([1, 1])
		.lineTo([0, 1])
		.close();
}

function u() {
	return new Pather()
		.lineTo([1 / 3, 0])
		.lineTo([1 / 3, 2 / 3])
		.lineTo([2 / 3, 2 / 3])
		.lineTo([2 / 3, 0])
		.lineTo([1, 0])
		.lineTo([1, 1])
		.lineTo([0, 1])
		.close();
}

var tests = [
	{
		name: "skeleton convex infinite",
		draw: draw,
		setup: function() {
			return [convex(), new Skeleton(convex(), Infinity, options)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.spokes.length > 0);
		}
	},
	{
		name: "skeleton convex 0.3",
		draw: draw,
		setup: function() {
			return [convex(), new Skeleton(convex(), 0.3, options)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.spokes.length > 0);
		}
	},

	{
		name: "skeleton concave infinite",
		draw: draw,
		setup: function() {
			return [concave(), new Skeleton(concave(), Infinity, options)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.spokes.length > 0);
		}
	},
	{
		name: "skeleton concave 0.2",
		draw: draw,
		setup: function() {
			return [concave(), new Skeleton(concave(), 0.2, options)];
		},
		assert: function(path, skeleton) {
			assert(skeleton.spokes.length > 0);
		}
	},

	{//	profile: true,
		name: "skeleton random infinite",
		draw: draw,
		only: RunRandomOnly,
		seed: seed,
		setup: function() {
			let shape = scenario(numberOfEdges, seed);
			//Drawing2D.log("skeleton random shape", [shape]);
			let skeleton = new Skeleton(shape, Infinity, options);
			return [shape, skeleton];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},
	{
		name: "skeleton random 0.075",
		draw: draw,
		seed: seed,
		setup: function() {
			let shape = scenario(numberOfEdges, seed);
			//Drawing2D.log("skeleton random shape", [shape]);
			let skeleton = new Skeleton(shape, 0.075, options);
			return [shape, skeleton];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},

	{
		name: "skeleton square infinite",
		draw: draw,
		setup: function() {
			var shape = square();
			return [shape, new Skeleton(shape, Infinity, options)];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},
	{
		name: "skeleton square 0.25",
		draw: draw,
		setup: function() {
			var shape = square();
			return [shape, new Skeleton(shape, 0.25, options)];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},

	{
		name: "skeleton box infinite",
		draw: draw,
		setup: function() {
			var shape = box();
			return [shape, new Skeleton(shape, Infinity, options)];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},
	{
		name: "skeleton box 0.1",
		draw: draw,
		setup: function() {
			var shape = box();
			return [shape, new Skeleton(shape, 0.1, options)];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},

	{
		name: "skeleton plus infinite",
		draw: draw,
		setup: function() {
			var shape = plus();
			return [shape, new Skeleton(shape, Infinity, options)];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},
	{
		name: "skeleton plus 0.1",
		draw: draw,
		setup: function() {
			var shape = plus();
			return [shape, new Skeleton(shape, 0.1, options)];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},

	{
		name: "skeleton L infinite",
		draw: draw,
		setup: function() {
			var shape = l();
			return [shape, new Skeleton(shape, Infinity, options)];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},
	{
		name: "skeleton L 0.1",
		draw: draw,
		setup: function() {
			var shape = l();
			return [shape, new Skeleton(shape, 0.1, options)];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},

	{
		name: "skeleton U infinite",
		draw: draw,
		setup: function() {
			var shape = u();
			return [shape, new Skeleton(shape, Infinity, options)];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},
	{
		name: "skeleton U 0.1",
		draw: draw,
		setup: function() {
			var shape = u();
			return [shape, new Skeleton(shape, 0.1, options)];
		},
		assert: function(shape, skeleton) {
			assert(skeleton.spokes.length > 0)
		}
	},

	{
		name: "skeleton stress test",
		only: RunStressTest,
		save: false,
		skip: !RunStressTest,
		draw: () => [],
		setup: function() {
			var i = 0;
			var random = new Random();
			while(true) {
				let sd = random.between(0, Number.MAX_SAFE_INTEGER);
				if (i % 10 == 0) console.clear();
				console.log(i++, sd);
				let shape = scenario(numberOfEdges, sd);
				new Skeleton(shape);
			}
			return [];
		},
		assert: function() {}
	},
];

var scenarios = {};
function scenario(numberOfPoints, seed) {
	if (scenarios[seed])
		return scenarios[seed];

	var step = 2 * Math.PI / numberOfPoints,
		angle = step,
		pather = new Pather([1, 0.5]),
		random = new Random(seed);

	for (var i = 0; i < (numberOfPoints - 1); i++) {
		var x = Math.cos(angle),
			y = Math.sin(angle),
			scale = random.get() * 0.9 + 0.1;
		var vector = vec2.scale(vec2(0, 0), [x, y], scale * 0.5);
		vec2.add(vector, vector, [0.5, 0.5]);
		pather.lineTo(vector);
		angle += step;
	}
	return scenarios[seed] = pather.close();
}

var DebugOptions = false;
for (let test of tests) {
	if (test.only === true) {
		DebugOptions = true;
		break;
	}
}

function newoptions() {
	if (RunRandomOnly || DebugOptions) {
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
	name: {value: "skeleton closed path tests"},
	tests: {value: tests},
	seed: {value: seed}
});
