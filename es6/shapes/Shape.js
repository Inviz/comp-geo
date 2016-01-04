exports.createConstructor = Shape;

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

function triangulate(minVertexDistance) {
	var geometry = new THREE.Geometry();

	var triangulation = earcut([this.contour.vertices(0, minVertexDistance)], true);

	for (var i = 0; i < triangulation.vertices.length/2; i ++)
		geometry.vertices.push(new THREE.Vector3(
			triangulation.vertices[i * 2],
			triangulation.vertices[i * 2 + 1], 0)
		);
	for (i = 0; i < triangulation.indices.length/3; i ++)
		geometry.faces.push(new THREE.Face3(
			triangulation.indices[i * 3],
			triangulation.indices[i * 3 + 1],
			triangulation.indices[i * 3 + 2])
		);

	return geometry;
}

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