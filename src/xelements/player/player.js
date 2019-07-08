const template = require('fs').readFileSync(`${__dirname}/player.html`, 'utf8');
const XElement = require('../XElement');
const storage = require('../../service/Storage');
const audio = require('../../service/audio');
const shortcuts = require('../../service/shortcuts');

const SEEK_DELTA_S = 10;

customElements.define('x-player', class Player extends XElement {
	static get observedAttributes() {
		return ['src'];
	}

	constructor() {
		super(template);
	}

	connectedCallback() {
		storage.playerSettings.then(({shuffle}) => {
			this.shuffleSet(shuffle);
			this.onEnd_();
		});

		audio.audioTrack.setTimeListener(() => this.onTimeChange_());
		audio.audioTrack.setEndListener(() => this.onEnd_());
		this.$('#time-bar').addEventListener('progress-set', ({detail}) => this.onSetTime_(detail));
		this.$('#prev').addEventListener('click', () => this.onPrev_());
		this.$('#pause').addEventListener('change', ({detail}) => this.onPauseSet_(!detail));
		this.$('#next').addEventListener('click', () => this.onEnd_());
		this.$('#shuffle').addEventListener('change', ({detail}) => this.onShuffleSet_(detail));

		shortcuts.addListenerKeydown(this.handleKeypress_.bind(this));
		shortcuts.addListenerGlobalPrev(() => this.onPrev_());
		shortcuts.addListenerGlobalNext(() => this.onEnd_());
		shortcuts.addListenerGlobalPause(() => this.pauseToggle_());
	}

	get src() {
		return this.getAttribute('src');
	}

	set src(value) {
		this.setAttribute('src', value);
	}

	async attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'src') {
			this.onPauseSet_(true);
			let audioData = await audio.getAudioData((await storage.readSong(newValue)).buffer);
			if (newValue !== this.src)
				return;
			audio.audioTrack.audioData = audioData;
			this.onSetTime_(0);
			this.onPauseSet_(false);
		}
	}

	onTimeChange_() {
		this.$('#time-bar').progress = audio.audioTrack.time / audio.audioTrack.duration;
		this.$('#time-bar').preValue = Player.timeFormat(audio.audioTrack.time);
		this.$('#time-bar').postValue = Player.timeFormat(audio.audioTrack.duration);
	}

	onEnd_() {
		this.dispatchEvent(new CustomEvent('next'));
	}

	onSetTime_(time) {
		audio.audioTrack.time = time * audio.audioTrack.duration;
		this.onTimeChange_();
	}

	onPrev_() {
		const PREVIOUS_SONG_THRESHOLD_S = 5;
		if (audio.audioTrack.time < PREVIOUS_SONG_THRESHOLD_S)
			this.dispatchEvent(new CustomEvent('prev'));
		else
			this.onSetTime_(0);
	}

	onPauseSet_(pause) {
		if (pause)
			audio.audioTrack.pause();
		else
			audio.audioTrack.play();
		this.$('#pause').checked = !audio.audioTrack.paused;
	}

	pauseToggle_() {
		this.onPauseSet_(!audio.audioTrack.paused);
	}

	onShuffleSet_(shuffle) {
		this.shuffleSet(shuffle);
		this.savePlayerSettings_();
	}

	shuffleSet(shuffle) {
		this.dispatchEvent(new CustomEvent('shuffle', {detail: shuffle}));
		this.$('#shuffle').checked = shuffle;
	}

	shuffleToggle_() {
		this.onShuffleSet_(this.$('#shuffle').checked = !this.$('#shuffle').checked);
	}

	seek_(deltaS) {
		audio.audioTrack.time = Math.min(audio.audioTrack.time + deltaS, audio.audioTrack.duration);
		this.onTimeChange_();
	}

	savePlayerSettings_() {
		storage.playerSettings = {shuffle: this.$('#shuffle').checked};
	}

	handleKeypress_(e) {
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
