// [min, max)
let randInt = (min, max) => parseInt(Math.random() * (max - min) + min);

class Seeker {
	constructor(size) {
		this.size = size;
		this.current = 0;
		this.isShuffle = false;
		this.shuffled = [];
	}

	setShuffle(shuffle) {
		if (shuffle)
			this.shuffle();
		else
			this.current = this.getCurrent();
		this.isShuffle = shuffle;
	}

	shuffle() {
		this.shuffled = Array(this.size).fill(0).map((_, i) => i);
		this.shuffled.forEach((_, i) => {
			let j = randInt(i, this.size);
			[this.shuffled[i], this.shuffled[j]] = [this.shuffled[j], this.shuffled[i]];
		});
	}

	lookup(index) {
		return this.isShuffle ? this.shuffled[index] : index;
	}

	getCurrent() {
		return this.lookup(this.current);
	}

	getNext() {
		if (++this.current === this.size)
			this.current = 0;
		return this.getCurrent();
	}

	getPrev() {
		if (--this.current === -1)
			this.current = this.size - 1;
		return this.getCurrent();
	}
}

module.exports = Seeker;
