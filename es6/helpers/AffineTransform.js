const AffineTransform = {
	create,
	map,
	mapRectangle,
	decompose,
	compose,

	determinant,
	isInversible,
	inverse,

	multiply,
	translate,
	scale,
	rotate,
	shear
};

module.exports = AffineTransform;

function create() {
	return [1, 0, 0, 1, 0, 0];
}

function map(matrix, position) {
	return [matrix[0] * position[0] + matrix[2] * position[1] + matrix[4],
			matrix[1] * position[0] + matrix[3] * position[1] + matrix[5]];
}

function mapRectangle(matrix, rectangle) {
	return Rectangle.corner(
		map(matrix, rectangle.origin),
		map(matrix, rectangle.corner));
}

function determinant(matrix) {
	return matrix[0] * matrix[3] - matrix[1] * matrix[2];
}

function isInversible(matrix) {
	return isDeterminantInversible(determinant(matrix));
}

function isDeterminantInversible(determinant) {
	return isFinite(determinant) && determinant !== 0;
}

function inverse(matrix) {
	let det = determinant(matrix);
	if (!isDeterminantInversible(det))
		return identity();

	return [
		matrix[3] / det,
		-matrix[1] / det,
		-matrix[2] / det,
		matrix[0] / det,
		(matrix[2] * matrix[5] - matrix[3] * matrix[4]) / det,
		(matrix[1] * matrix[4] - matrix[0] * matrix[5]) / det];
}

function multiply(a, b) {
	return [
		b[0] * a[0] + b[1] * a[2],
		b[0] * a[1] + b[1] * a[3],
		b[2] * a[0] + b[3] * a[2], 
		b[2] * a[1] + b[3] * a[3],
		b[4] * a[0] + b[5] * a[2] + a[4],
		b[4] * a[1] + b[5] * a[3] + a[5]];
}

function translate(matrix, translation) {
	var transformed = matrix.slice();
	transformed[4] += translation[0] * matrix[0] + translation[1] * matrix[2];
	transformed[5] += translation[0] * matrix[1] + translation[1] * matrix[3];
	return transformed;
}

function scale(matrix, scale) {
	var transformed = matrix.slice();
	transformed[0] *= scale[0];
	transformed[1] *= scale[0];
	transformed[2] *= scale[1];
	transformed[3] *= scale[1];
	return transformed;
}

function rotate(matrix, radians) {
    var cosAngle = Math.cos(radians),
    	sinAngle = Math.sin(radians);
    return multiply(matrix, [cosAngle, sinAngle, -sinAngle, cosAngle, 0, 0]);
}

function shear(matrix, shearing) {
	var transformed = matrix.slice();
	transformed[0] += shearing[1] * matrix[2];
	transformed[1] += shearing[1] * matrix[3];
	transformed[2] += shearing[0] * matrix[0];
	transformed[3] += shearing[0] * matrix[1];
	return transformed;
}

function decompose(matrix) {
	// Remove scaling
	var scale = [Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1]),
    			 Math.sqrt(matrix[2] * matrix[2] + matrix[3] * matrix[3])];
	if ((matrix[0] * matrix[3] - matrix[2] * matrix[1]) < 0) {
		if (matrix[0] < matrix[3])
			scale[0] = -scale[0];
		else
			scale[1] = -scale[1];
	}
    matrix = AffineTransform.scale(matrix, [1 / scale[0], 1 / scale[1]]);

    // Remove rotation
	var angle = Math.atan2(matrix[1], matrix[0]);
	matrix = AffineTransform.rotate(matrix, -angle);

	return {"scale": scale,
			"rotate": angle,
			"translate": [matrix[4], matrix[5]],
			"remainder": matrix};
}

function compose(composition) {
	return AffineTransform.scale(
			AffineTransform.rotate(
				composition.remainder,
				composition.rotate),
			composition.scale);
}
