export default function PathCollisionCollection () {
	this.pathsToObjects = new Map();
	this.objectsToPaths = new Map();
}

Object.assign(PathCollisionCollection.prototype, {
	add, remove,
	collide
});

function add (path, object) {
	this.pathsToObjects.set(path, object);
	this.objectsToPaths.set(object, path);
}

function remove (object) {
	let path = this.objectsToPaths.get(object);
	this.objectsToPaths.delete(object);
	this.pathsToObjects.delete(path);
}

function * collide (path) {
	for (let otherPath of this.pathsToObjects.keys()) {
		if (path === otherPath) continue;
		let intersectionPoints = path.intersections(otherPath);
		if (intersectionPoints.length) yield {
			object: this.pathsToObjects.get(otherPath),
			points: intersectionPoints.map(point => point.p),
		};
	}
}