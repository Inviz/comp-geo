require("babel-core/register")({
	blacklist: ['regenerator', 'es6.forOf'],
	optional: ['es7.classProperties']
});

const TestRunner = require('./TestRunner');
const fs = require("fs");
const path = require("path")

const primitiveTests = [];

["primitives", "intersections", "clipper", ""].forEach(function (testGroup) {
	var tests = [];

	fs.readdirSync(path.join(__dirname, "./tests/" + testGroup)).forEach(function (file) {
		tests.push(require("./tests/" + testGroup + "/" + file));
	});

	TestRunner.test(tests);
});