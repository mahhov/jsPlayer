const BAR_COUNT = 32 * 4; // todo duplicate constant, also defined in audioVisualizer

class AudioTrack {
	constructor() {
		this.audioCtx_ = new AudioContext();
		this.analyzer = this.audioCtx_.createAnalyser();
		this.analyzer.fftSize = BAR_COUNT * 2;
		this.paused_ = true;
		this.offsetTime_ = 0;
	}

	readAudioData(fileBuffer) {
		return this.audioCtx_.decodeAudioData(fileBuffer);
		// todo check if we can read and set audio data in 1 function.
		// Currently, we have 2 functions because we want to check in between that the audio is still relevant
		// E.g. the user didn't selected another audio while we were reading the audio data.
	}

	set audioData(audioData) {
		this.audioData_ = audioData;
	}

	setTimeListener(listener) {
		this.timeListener_ = listener;
	}

	setEndListener(listener) {
		this.endListener_ = listener;
	}

	get paused() {
		return this.paused_;
	}

	play() {
		if (!this.paused_ || !this.audioData_)
			return;

		this.paused_ = false;
		this.source_ = this.audioCtx_.createBufferSource();
		this.source_.buffer = this.audioData_;
		this.source_.connect(this.audioCtx_.destination);
		this.source_.connect(this.analyzer);
		this.source_.start(0, this.offsetTime_);
		this.offsetTime_ -= this.audioCtx_.currentTime;

		this.timeListenerIntervalId_ = setInterval(() => this.timeListener_(this.time, this.duration), 100);
		this.source_.addEventListener('ended', this.sourceEndedListener_ = () => {
			clearInterval(this.timeListenerIntervalId_);
			if (this.endListener_)
				this.endListener_();
		});
	}

	pause() {
		if (this.paused_)
			return;

		this.paused_ = true;
		this.source_.removeEventListener('ended', this.sourceEndedListener_);
		this.source_.stop();
		this.source_.disconnect();
		this.offsetTime_ += this.audioCtx_.currentTime;

		clearInterval(this.timeListenerIntervalId_);
	}

	togglePause() {
		if (this.paused_)
			this.play();
		else
			this.pause();
	}

	get time() {
		return this.audioCtx_ ?
			this.paused_ ?
				this.offsetTime_ :
				this.offsetTime_ + this.audioCtx_.currentTime :
			0;
	}

	set time(time) {
		let paused = this.paused_;
		this.pause();
		this.offsetTime_ = Math.max(time, 0);
		if (!paused)
			this.play();
	}

	get duration() {
		return this.audioData_ ? this.audioData_.duration : 0;
	}
}

module.exports = AudioTrack;
