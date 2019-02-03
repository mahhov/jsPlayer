const template = require('fs').readFileSync(`${__dirname}/player.html`, 'utf8');
const XElement = require('../XElement');
const path = require('path');
const storage = require('../../service/Storage');
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
		storage.getPlayerSettings().then(({volume, shuffle}) => {
			this.setVolume(volume);
			this.shuffleSet(shuffle);
			this.onEnd_();
		});

		this.$('audio').addEventListener('timeupdate', () => this.onTimeChange_());
		this.$('audio').addEventListener('ended', () => this.onEnd_());
		this.$('#time-bar').addEventListener('progress-set', ({detail}) => this.onSetTime_(detail));
		this.$('#mute').addEventListener('change', () => this.muteToggle_());
		this.$('#volume-bar').addEventListener('progress-set', ({detail}) => this.onSetVolume_(detail));
		this.$('#prev').addEventListener('click', () => this.onPrev_());
		this.$('#pause').addEventListener('change', ({detail}) => this.onPauseSet_(detail));
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

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'src') {
			this.$('audio').src = storage.getSong(newValue);
			this.play_();
		}
	}

	onTimeChange_() {
		let {currentTime, duration} = this.$('audio');
		this.$('#time-bar').progress = currentTime / duration;
		this.$('#time-bar').preValue = Player.timeFormat(currentTime);
		this.$('#time-bar').postValue = Player.timeFormat(duration);
	}

	onEnd_() {
		this.dispatchEvent(new CustomEvent('next'));
	}

	onSetVolume_(volume) {
		this.setVolume(volume);
		this.savePlayerSettings_();
	}

	setVolume(volume = 0) {
		volume = Math.round(volume * 20) / 20;

		const THRESHOLD = .15;
		if (volume < THRESHOLD)
			volume = 0;
		if (volume > 1 - THRESHOLD)
			volume = 1;

		this.$('#mute').checked = volume;
		this.$('#volume-bar').progress = volume;
		this.$('#volume-bar').preValue = Player.volumeFormat(volume);
		this.$('audio').volume = volume;
	}

	onSetTime_(time) {
		this.$('audio').currentTime = time * this.$('audio').duration;
	}

	onPrev_() {
		const PREVIOUS_SONG_THRESHOLD_S = 5;
		if (this.$('audio').currentTime < PREVIOUS_SONG_THRESHOLD_S)
			this.dispatchEvent(new CustomEvent('prev'));
		else
			this.onSetTime_(0);
	}

	onPauseSet_(play) {
		if (!play)
			this.$('audio').pause();
		else
			this.play_();
	}

	pauseToggle_() {
		this.onPauseSet_(this.$('#pause').checked = !this.$('#pause').checked);
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

	play_() {
		this.$('audio').play().catch(e => console.error('err playing', e));
	}

	seek_(deltaS) {
		this.$('audio').currentTime = this.$('audio').currentTime + deltaS;
	}

	muteToggle_() {
		if (this.$('audio').volume) {
			this.unmuteVolume_ = this.$('audio').volume;
			this.onSetVolume_(0);
		} else
			this.onSetVolume_(this.unmuteVolume_ || 1);
	}

	savePlayerSettings_() {
		storage.savePlayerSettings({
			volume: this.$('audio').volume,
			shuffle: this.$('#shuffle').checked,
		});
	}

	handleKeypress_(e) {
		if (e.repeat)
			return;
		switch (e.key) {
			case 'ArrowLeft':
				this.onPrev_();
				break;
			case 'ArrowRight':
				this.onEnd_();
				break;
			case 'ArrowUp':
				this.shuffleToggle_();
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
			case 'm':
				this.muteToggle_();
				break;
		}
	}

	static volumeFormat(volume) {
		return Player.num2str((volume * 100).toFixed(0), 2);
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
