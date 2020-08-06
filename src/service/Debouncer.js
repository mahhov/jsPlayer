class Debouncer {
	constructor(delay, syncOnly = false) {
		this.delay_ = delay;
		this.syncOnly_ = syncOnly;
	}

	static sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async add(handler) {
		this.nextHandler_ = handler;
		if (this.wait_ && this.syncOnly_)
			return;
		await this.wait_;
		if (this.nextHandler_ !== handler)
			return;
		this.wait_ = Promise.resolve(handler())
			.then(() => Debouncer.sleep(this.delay_));
		await this.wait_;
		this.wait_ = null;
	}

	cancel() {
		this.nextHandler_ = null;
	}
}

module.exports = Debouncer;
