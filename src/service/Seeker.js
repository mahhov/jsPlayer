class Seeker {
	constructor() {
		this.size_ = 0;
		this.index_ = -1;
		this.shuffled_ = [];
	}

	setSize(size) {
		this.size_ = size;
		if (this.shuffled_.length) {
			this.setShuffle(false);
			this.setShuffle(true);
		}
	}

	setShuffle(shuffle) {
		if (shuffle && !this.shuffled_.length) {
			this.shuffle_();
			this.skipTo(this.index_);
		} else if (!shuffle && this.shuffled_.length) {
			this.index_ = this.getValue_();
			this.shuffled_ = [];
		}
	}

	shuffle_() {
		this.shuffled_ = Array(this.size_).fill(0).map((_, i) => i);
		this.shuffled_.forEach((_, i) => {
			let j = Math.floor(Math.random() * (this.size_ - i) + i);
			[this.shuffled_[i], this.shuffled_[j]] = [this.shuffled_[j], this.shuffled_[i]];
		});
	}

	getValue_(index = this.index_) {
		return this.shuffled_[index] !== undefined ? this.shuffled_[index] : index;
	}

	getIndex_(value) {
		let index = this.shuffled_.indexOf(value);
		return index === -1 ? value : index;
	}

	skipTo(value) {
		this.index_ = this.getIndex_(value);
	}

	getNext() {
		if (++this.index_ === this.size_)
			this.index_ = 0;
		return this.getValue_();
	}

	getPrev() {
		if (--this.index_ === -1)
			this.index_ = this.size_ - 1;
		return this.getValue_();
	}

	peek(prevCount, nextCount) {
		let peek = [];
		for (let i = this.index_ - prevCount; i <= this.index_ + nextCount; i++) {
			let index = ((i + this.size_) % this.size_ + this.size_) % this.size_;
			peek.push(this.getValue_(index));
		}
		return peek;
	}
}

module.exports = Seeker;
