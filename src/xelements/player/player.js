const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const storage = require('../../service/storage');
const AudioTrack = require('../../service/AudioTrack');
const shortcuts = require('../../service/shortcuts');

const SEEK_DELTA_S = 10;

customElements.define(name, class Player extends XElement {
	static get attributeTypes() {
		return {src: false, focus: true};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		storage.playerSettings.then(({shuffle}) => {
			this.shuffleSet(shuffle);
			this.onEnd_();
		});

		this.audioTrack_ = new AudioTrack();
		this.audioTrack_.setTimeListener(() => this.onTimeChange_());
		this.audioTrack_.setEndListener(() => this.onEnd_());
		this.$('#time-bar').addEventListener('progress-set', ({detail}) => this.onSetTime_(detail));
		this.$('#prev').addEventListener('click', () => this.onPrev_());
		this.$('#pause').addEventListener('change', ({detail}) => this.onPauseSet_(!detail));
		this.$('#next').addEventListener('click', () => this.onEnd_());
		this.$('#shuffle').addEventListener('change', ({detail}) => this.onShuffleSet_(detail));

		this.$('#visualizer').analyzer = this.audioTrack_.analyzer;

		shortcuts.addListenerKeydown(this.handleKeypress_.bind(this));
		shortcuts.addListenerGlobalPrev(() => this.focus_ && this.onPrev_());
		shortcuts.addListenerGlobalNext(() => this.focus_ && this.onEnd_());
		shortcuts.addListenerGlobalPause(() => this.focus_ && this.pauseToggle_());
	}

	set src(value) {
		this.onPauseSet_(true);
		storage.readSong(value)
			.then(({buffer}) => this.audioTrack_.readAudioData(buffer))
			.then(audioData => {
				if (value !== this.src)
					return;
				this.audioTrack_.audioData = audioData;
				this.onSetTime_(0);
				this.onPauseSet_(false);
			});
	}

	set focus(value) {
		this.focus_ = value;
	}

	onTimeChange_() {
		this.$('#time-bar').progress = this.audioTrack_.time / this.audioTrack_.duration;
		this.$('#time-bar').preValue = Player.timeFormat(this.audioTrack_.time);
		this.$('#time-bar').postValue = Player.timeFormat(this.audioTrack_.duration);
	}

	onEnd_() {
		this.dispatchEvent(new CustomEvent('next'));
	}

	onSetTime_(time) {
		this.audioTrack_.time = time * this.audioTrack_.duration;
		this.onTimeChange_();
	}

	onPrev_() {
		const PREVIOUS_SONG_THRESHOLD_S = 5;
		if (this.audioTrack_.time < PREVIOUS_SONG_THRESHOLD_S)
			this.dispatchEvent(new CustomEvent('prev'));
		else
			this.onSetTime_(0);
	}

	onPauseSet_(pause) {
		if (pause)
			this.audioTrack_.pause();
		else {
			this.audioTrack_.play();
			this.dispatchEvent(new CustomEvent('player-play', {composed: true}));
		}
		this.$('#pause').checked = !this.audioTrack_.paused;
	}

	pauseToggle_() {
		this.onPauseSet_(!this.audioTrack_.paused);
	}

	stopPlay() {
		this.onPauseSet_(true);
	}

	onShuffleSet_(shuffle) {
		this.shuffleSet(shuffle);
		storage.addPlayerSettings({shuffle: this.$('#shuffle').checked});
	}

	shuffleSet(shuffle) {
		this.dispatchEvent(new CustomEvent('shuffle', {detail: shuffle}));
		this.$('#shuffle').checked = shuffle;
	}

	seek_(deltaS) {
		this.audioTrack_.time = Math.min(this.audioTrack_.time + deltaS, this.audioTrack_.duration);
		this.onTimeChange_();
	}

	handleKeypress_(e) {
		if (!this.focus_)
			return;

		switch (e.key) {
			case 'ArrowLeft':
				this.onPrev_();
				break;
			case 'ArrowRight':
				this.onEnd_();
				break;
			case 'ArrowDown':
			case ' ':
				this.pauseToggle_();
				break;
			case ',':
				this.seek_(-SEEK_DELTA_S);
				break;
			case '.':
				this.seek_(SEEK_DELTA_S);
				break;
		}
	}

	static timeFormat(seconds) {
		seconds = parseInt(seconds);
		let remainderSeconds = Player.num2str(seconds % 60, 2);
		let minutes = Player.num2str((seconds - remainderSeconds) / 60);
		return `${minutes}:${remainderSeconds}`;
	}

	static num2str(number, length) {
		return number.toString().padStart(length, 0);
	}
});
