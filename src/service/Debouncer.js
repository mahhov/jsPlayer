class Debouncer {
	constructor(delay) {
		this.delay_ = delay;
	}

	static sleep_(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async add(handler) {
		this.nextHandler_ = handler;
		await this.wait_;
		if (this.nextHandler_ !== handler)
			return;
		this.wait_ = Promise.resolve(handler())
			.then(() => Debouncer.sleep_(this.delay_));
	}

	cancel() {
		this.nextHandler_ = null;
	}
}

module.exports = Debouncer;
