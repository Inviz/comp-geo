import * as THREE from 'three';
import { ROUGHLY_EPSILON } from '../missing-stuff';
import vec3 from '../nd-linalg/Vector3';

import cdt2d from 'cdt2d';
import cleanPSLG from 'clean-pslg';

export default Shape;

function Shape(contourPath, holes) {
	this.contour = contourPath;
	this.holes = holes || [];
}

Object.defineProperties(Shape.prototype, {
	"contains": {value: contains},
	"union": {value: union},
	"difference": {value: difference},
	"intersection": {value: intersection},
	"not": {value: not},
	"triangulate": {value: triangulate},
	"area": {value: area},
	"split": {value: split},
	"grow": {value: grow},
	"growWithSkeleton": {value: growWithSkeleton}
});

function contains(otherShape) {
	var intersects = this.contour.intersections(otherShape.contour).length === 0;
	if (intersects) return false;

	for (var point of otherShape.contour.segments.map(s => s.start)) {
		if (!this.contour.containsPoint(point)) return false;
	}

	return true;
}

function union(otherShape) {

}

function difference(otherShape, clipGrowthOffset) {
	if (otherShape.contains(this)) return [];
	var difference = Clipper.difference(this.contour, otherShape.grow(clipGrowthOffset).contour);
	return difference.map(contour => new Shape(contour));
}

function intersection(otherShape) {

}

function not(otherShape) {

}

function triangulate(minVertexDistance = 0.00001) {
	const geometry = new THREE.Geometry();

	const points = [];
	const edges = [];

	const vertices = [];

	this.contour.segments.forEach( function( {start, end}, index ){
		vertices.push( start, end );
		points.push( [start[0], start[1]], [end[0], end[1]] );
		edges.push( [index * 2, index * 2 + 1] );
	});

	//	preserve z-axis data...
	const zs = {};
	vertices.forEach( function( [x,y,z] ){
		zs[ x.toFixed(4)+'_'+y.toFixed(4) ] = z;
	});

	//	clean up skeleton + contour because it's not a valid edge loop
	cleanPSLG( points, edges );

	const triangulation = cdt2d( points, edges, {exterior:false} );

	const points3D = points.map( function( [x,y] ){
		const key = x.toFixed(4)+'_'+y.toFixed(4);
		const z = zs[key];
		if( z === undefined ){
			return [ x,y,0 ];
		}
		return [x,y,z];
	});

	// console.log( zs, points3D );

	geometry.vertices = points3D.map( function( [x,y,z] ){
		return new THREE.Vector3( x,y,z );
	});

	geometry.faces = triangulation.map( function( [ix, iy, iz] ){
		return new THREE.Face3( ix, iy, iz );
	});

	return geometry;
}

// function triangulate2(minVertexDistance = 0.00001) {
// 	var geometry = new THREE.Geometry();

// 	const vs = this.contour.vertices(0, minVertexDistance);

// 	//	TODO / FIXME
// 	//	this is pretty awful, find a more elegant solution...
// 	const unique = [];
// 	for( let i=0; i<vs.length; i++ ){
// 		const vertex = vs[ i ];

// 		let found = false;
// 		for( let s=0; s<unique.length; s++ ){
// 			if( vec3.dist( unique[ s ], vertex ) < minVertexDistance ){
// 				found = true;
// 				break;
// 			}
// 		}

// 		if( !found ){
// 			unique.push( vertex );
// 		}
// 	}

// 	console.log( unique );

// 	const vertices = unique.reduce( function( collection, vertex ){
// 		const z = vertex[2] !== undefined ? vertex[2] : 0;
// 		collection.push( vertex[0], vertex[1], z );
// 		return collection;
// 	}, [] );

// 	// console.log(vertices);

// 	var triangulation = earcut( vertices, null, 3 );
// 	console.log(triangulation);

// 	for (var i = 0; i < triangulation.length; i +=3){
// 		const ia = triangulation[ i ] * 3;
// 		const ib = triangulation[ i + 1 ] * 3;
// 		const ic = triangulation[ i + 2 ] * 3;

// 		const va = new THREE.Vector3( vertices[ia], vertices[ia+1], vertices[ia+2] );
// 		const vb = new THREE.Vector3( vertices[ib], vertices[ib+1], vertices[ib+2] );
// 		const vc = new THREE.Vector3( vertices[ic], vertices[ic+1], vertices[ic+2] );

// 		geometry.vertices.push( va, vb, vc );
// 		geometry.faces.push( new THREE.Face3( i, i+1, i+2 ) );

// 		// console.log( i, va, i+1, vb, i+2, vc );
// 	}

// 	// console.log( geometry.vertices );

// 	return geometry;
// }

function area() {
	var vertices = earcut([this.contour.vertices(0, 1)]);

	var area = 0;
	var side1 = vec2(0, 0);
	var side2 = vec2(0, 0);

	for (var t = 0; t < vertices.length; t += 3) {
		vec2.sub(side1, vertices[t + 1], vertices[t]);
		vec2.sub(side2, vertices[t + 2], vertices[t]);
		area += 0.5 * Math.abs(vec2.crossz(side1, side2));
	}

	return area;
}

function split(splittingBiRay) {
	// TODO faking it by intersecting the shape with two really large boxes on either side of the biray
	// TODO doesn't handle split resulting in more than 2 shapes
	var boxSize = 1000;
	var perpendicularDirection = vec2.perpendicular(vec2(0, 0), splittingBiRay.direction);

	var box1 = (new Pather())
		.lineTo(splittingBiRay.direction)
		.lineTo(vec2.add(vec2(0, 0), splittingBiRay.direction, perpendicularDirection))
		.lineTo(vec2.sub(vec2(0, 0), perpendicularDirection, splittingBiRay.direction))
		.lineTo(vec2.negate(vec2(0, 0), splittingBiRay.direction))
		.close()
		.scale(boxSize)
		.translate(splittingBiRay.middle);

	var box2 = box1.translate(vec2.scale(vec2(0, 0), perpendicularDirection, -boxSize));

	var results = [
		Clipper.intersection(this.contour, box1)[0],
		Clipper.intersection(this.contour, box2)[0]
	].filter(c => c).map(c => new Shape(c));

	for (var shape of results) {
		if (!shape.contour.isClosed) {
			DebugPaths.add(box1, 0x00ff00, "splitfail", 0, 2);
			DebugPaths.add(this.contour, 0x00ffff, "splitfail", 0, 4);
			DebugPaths.add(shape.contour, 0xff00ff, "splitfail", 0, 4);
			throw("splitfail");
		}
	}

	return results;
}

function grow (amount) {


	//var offsetContour = this.contour.offsetPerpendicular(this.contour.isCounterClockwise ? amount : -amount);
	//DebugPaths.add(offsetContour, 0xffffff, "grow", 0, 1);
	//offsetContour = offsetContour.makeContiguous(true);
	//DebugPaths.add(offsetContour, 0x888888, "grow", 0, 1.5);
	//offsetContour = offsetContour.simplifySelfIntersections();
	//DebugPaths.add(offsetContour, 0x8800ff, "grow", 0, 2);
	return new Shape(offsetContour);
}

function growWithSkeleton (amount) {
	var skeleton = new Skeleton(amount > 0 ? this.contour : this.contour.reverse(), Math.abs(amount));
	return new Shape(skeleton.waves[0].path);
}