Object.adopt(exports, {
	"createConstructor": Drawing2DLinearGradient
});

function Drawing2DLinearGradient(start, end) {
	this.start = start;
	this.end = end;
	this.stops = [];
}

Object.adopt(Drawing2DLinearGradient.prototype, {
	addColorStop, apply,
	"isLinearGradient": true
});

function addColorStop(offset, color) {
	this.stops.push({offset, color});
}

var cache = {self: null, context: null, gradient: null};
function apply(ctx, context) {
	if (self === this && cache.context === context) {
		ctx.strokeStyle = cache.gradient;
		ctx.fillStyle = cache.gradient;
		return;
	}
	let start = context.map(this.start),
		end = context.map(this.end);
	let gradient = ctx.createLinearGradient(start[0], start[1], end[0], end[1]);
	for (let stop of this.stops)
		gradient.addColorStop(stop.offset, stop.color);
	ctx.strokeStyle = gradient;
	ctx.fillStyle = gradient;
	cache.context = context;
	cache.gradient = gradient;
	cache.self = this;
}
