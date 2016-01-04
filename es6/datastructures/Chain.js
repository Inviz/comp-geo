let lastElementId = 0;

export default class Chain {
	constructor () {
		this.previous = this;
		this.next = this;
		this.id = lastElementId;
		lastElementId++;
	}

	static connect (previous, next) {
		previous.next = next;
		next.previous = previous;
	}

	static disconnect (node) {
		this.previous = this;
		this.next = this;
	}

	length () {
		let length = 0;
		for (let each of this) length++;
		return length;
	}

	isSingleElement () {
		return this.next === this && this.previous === this;
	}

	* [Symbol.iterator] () {
		let current = this;
		do {
			yield current;
			current = current.next;
		} while (current !== this);
	}
}