import Drawing2D from './es6/drawing/Drawing2D';
import fs from 'fs';

// Set to true to always draw test results, even if the test passes
// This is not advised, there's some sort of exponential slow down
// in console.log output with node-webkit that kills the execution
// of the tests if too many graphics are output.

// If you want to halt on a test failure of any kind, enable this
var DEBUG_HALT_ON_ERROR = false;

// If you want to see the output of a specific test even though it
// is passing, set drawMe: true on the test itself.
var DEBUG_DRAW = true;

// Expand drawings even on passing
var EXPAND_PASSED_DRAW = true;

// Set to true to show green/red colouring of test results
var OUTPUT_COLOURFUL = true;

Object.defineProperties(exports, {
	"test": {value: (modules) => new TestRunner(modules)}
});

function TestRunner(testModules) {
	this.isGraphical = !!global["window"];
	this.isColourful = this.isGraphical && OUTPUT_COLOURFUL;

	this.failed = [];
	this.modules = [];
	this.tests = [];

	for (let module of testModules) {
		let tests = [], exclusive = [];

		for (let test of module.tests.slice()) {
			let testcase = {module: module, test: test, passed: false};
			if (test.skip !== true) {
				test.only === true
					? exclusive.push(testcase)
					: exclusive.length === 0 && tests.push(testcase);
			}
		}
		if (exclusive.length) tests = exclusive;

		this.modules.push({name: module.name, original: module, tests: tests});

		for (let test of tests)
			this.tests.push(test);
	}

	this.run();
	this.report();
}
Object.defineProperties(TestRunner.prototype, {
	"run": 			{value: run},
	"runModule": 	{value: runModule},
	"runTest": 		{value: runTest},
	"report": 		{value: report}
});

function report() {
	var total = this.tests.length,
		failures = this.failed.length,
		passes = total - failures,
		style = "font-weight: bold; color: " + (failures > 0 ? "red" : "black"),
		description = `Tests: ${total} Passes: ${passes} Failures: ${failures}`;

	this.isColourful
		? console.log("%c" + description, style)
		: console.log(description);
}

function run() {
	for (let module of this.modules)
		this.runModule(module);
}

function runModule(module) {
	this.isColourful
		? console.group("%c" + module.name, "font-weight: bold")
		: console.log(module.name);

	for (let testcase of module.tests)
		this.runTest(testcase);

	this.isColourful && console.groupEnd("%c" + module.name);
}

function runTest(testcase) {
	captureConsole(`while testing ${testcase.test.name}...`);
		if (testcase.test.profile) console.profile(testcase.test.name);
		var startTime = new Date().getTime(),
			test = testcase.test,
			data = test.setup() || [],
			failed = false,
			reason;
		if (testcase.test.profile) console.profileEnd(testcase.test.name);

		if (DEBUG_HALT_ON_ERROR) {
			test.assert.apply(test, data);
		} else {
			try {
				test.assert.apply(test, data);
			} catch(e) {
				failed = true;
				reason = e;
			}
		}
		var stopTime = new Date().getTime();
	restoreConsole();

	testcase.passed = !failed;

	var description = `${failed ? "failed" : "passed"} ${test.name} [${stopTime-startTime}ms]`,
		style = `font-weight: bold; color: ${failed ? "red" : "green"}`,
		showdrawing = this.isGraphical && !!test.draw && (failed || DEBUG_DRAW),
		consoleFunction = showdrawing
			? (failed || EXPAND_PASSED_DRAW)
				? console.group
				: console.groupCollapsed
			: console.log;

	this.isColourful
		? consoleFunction.call(console, "%c" + description, style)
		: consoleFunction.call(console, "\t" + description);

	if (failed) {
		this.failed.push(testcase);

		if (reason.expected && reason.actual) {
			console.warn("%c" + JSON.stringify(reason.expected), "color: blue");
			console.warn("%c" + JSON.stringify(reason.actual), "color: red");
			console.warn(reason, data);
		} else {
			console.warn(`\t\t${reason.message}`, reason, data);
		}
	}

	if (showdrawing) {
		let drawData = test.draw ? test.draw.apply(test, data) : data;
		if (drawData.length > 0) {
			let drawing = Drawing2D.canvas(drawData);
			console.canvas(drawing);
			if (!test.save) {
				let filepath = ["test-results", testcase.module.name, test.name + ".png"];

				for (var k = 1; k < filepath.length; k++) {
					let path = filepath.slice(0, k).join("/");
					if (!fs.existsSync(path))
						fs.mkdirSync(path);
				}
				drawing.saveAsPNG(filepath.join("/"));
			}
		}
	}
	showdrawing && console.groupEnd("%c" + description);
}

// During testing we steal the console.log, but return it at the end of report
// If a test attempts to write to the console, first we output the title of
// the test so that the data is married to the test being tested, rather than
// the 'passed' or 'failed' message of the previous test
var capturedConsole = {};
function restoreConsole() {
	for (let key in capturedConsole) {
		console[key] = capturedConsole[key];
		delete capturedConsole[key];
	}
}
function captureConsole(title) {
	function intercept(mode, args) {
		restoreConsole();
		console.log(title);
		return console[mode].apply(console, args);
	}

	capturedConsole = {
		log: console.log,
		info: console.info,
		warn: console.warn,
		error: console.error,
		canvas: console.canvas,
		canvasCollapsed: console.canvasCollapsed,
		canvasinfo: console.canvasinfo,
		canvaswarn: console.canvaswarn,
		canvaserror: console.canvaserror,
		group: console.group
	};

	for (let key in capturedConsole)
		console[key] = function() { return intercept(key, arguments) };
}
