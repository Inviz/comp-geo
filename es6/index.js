require("babel-core/register")({
	blacklist: ['regenerator', 'es6.forOf'],
	optional: ['es7.classProperties']
});

// import Clipper from './es6/clipper/clipper';
// import Intersections from './es6/intersections/Intersections';
// import PathCollisionCollection from './es6/shapes/PathCollisionCollection';
import Skeleton from './skeleton/Skeleton';
// import Circle from './es6/primitives/Circle';
// import Curve from './es6/primitives/Curve';
// import Line from './es6/primitives/Line';
// import LineSegment from './es6/primitives/LineSegment';
// import Ray from './es6/primitives/Ray';
// import Rectangle from './es6/primitives/Rectangle';
// import Triangle from './es6/primitives/Triangle';
import Path from './shapes/Path';
import Pather from './helpers/Pather';
import Shape from './shapes/Shape';
// import Stroke from './es6/shapes/Stroke';

export default {
	Skeleton,
	shapes: {
		Path, Pather, Shape
	}
}

// module.exports = {
// 	Clipper: require('./es6/clipper/Clipper'),
// 	Intersections: require('./es6/intersections/Intersections').default,
// 	PathCollisionCollection: require('./es6/shapes/PathCollisionCollection'),
// 	Skeleton: require('./es6/skeleton/Skeleton').default,
// 	primitives: {
// 		Circle: require('./es6/primitives/Circle'),
// 		Curve: require('./es6/primitives/Curve'),
// 		Line: require('./es6/primitives/Line'),
// 		LineSegment: require('./es6/primitives/LineSegment'),
// 		Ray: require('./es6/primitives/Ray'),
// 		Rectangle: require('./es6/primitives/Rectangle'),
// 		Triangle: require('./es6/primitives/Triangle')
// 	},
// 	shapes: {
// 		Path: require('./es6/shapes/Path').default,
// 		Pather: require('./es6/helpers/Pather').default,
// 		Shape: require('./es6/shapes/Shape').default,
// 		Stroke: require('./es6/shapes/Stroke').default
// 	},
// 	Drawing2D: require('./es6/drawing/Drawing2D')
// };