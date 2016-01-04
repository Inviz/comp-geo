require("babel-core/register")({
	blacklist: ['regenerator', 'es6.forOf'],
	optional: ['es7.classProperties']
});

module.exports = {
	Clipper: require('./es6/clipper/Clipper'),
	Intersections: require('./es6/intersections/Intersections').default,
	PathCollisionCollection: require('./es6/shapes/PathCollisionCollection'),
	Skeleton: require('./es6/skeleton/Skeleton'),
	primitives: {
		Circle: require('./es6/primitives/Circle'),
		Curve: require('./es6/primitives/Curve'),
		Line: require('./es6/primitives/Line'),
		LineSegment: require('./es6/primitives/LineSegment'),
		Ray: require('./es6/primitives/Ray'),
		Rectangle: require('./es6/primitives/Rectangle'),
		Triangle: require('./es6/primitives/Triangle')
	},
	shapes: {
		Path: require('./es6/shapes/Path'),
		Pather: require('./es6/helpers/Pather'),
		Shape: require('./es6/shapes/Shape'),
		Stroke: require('./es6/shapes/Stroke')
	}
};