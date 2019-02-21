const BAR_COUNT = 32 * 4;

class AudioTrack {
	constructor(audioCtx, analyzer) {
		this.audioCtx_ = audioCtx;
		this.analyzer_ = analyzer;
		this.paused_ = true;
		this.offsetTime_ = 0;

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
		this.source_.connect(this.analyzer_);
		this.source_.start(0, this.offsetTime_);
		this.offsetTime_ -= this.audioCtx_.currentTime;

		this.timeListenerIntervalId_ = setInterval(() => this.timeListener_(this.time, this.duration), 100);
		this.source_.addEventListener('ended', () => {
			clearInterval(this.timeListenerIntervalId_);
			if (this.endListener_)
				this.endListener_();
		});
	}

	pause() {
		if (this.paused_)
			return;

		this.paused_ = true;
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
		return this.paused_ ? this.offsetTime_ : this.offsetTime_ + this.audioCtx_.currentTime;
	}

	set time(time) {
		let paused = this.paused_;
		this.pause();
		this.offsetTime_ = Math.max(time, 0);
		if (!paused)
			this.play();
	}

	get duration() {
		return this.audioData_.duration;
	}
}

let audioCtx = new AudioContext();
let audioAnalyzer = audioCtx.createAnalyser();
audioAnalyzer.fftSize = BAR_COUNT * 2;

let audioTrack = new AudioTrack(audioCtx, audioAnalyzer);

let getAudioData = fileBuffer => audioCtx.decodeAudioData(fileBuffer);

module.exports = {audioTrack, audioAnalyzer, getAudioData};