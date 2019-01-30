const template = require('fs').readFileSync(`${__dirname}/player.html`, 'utf8');
const XElement = require('../XElement');
const path = require('path');
const storage = require('../../service/Storage');

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
			this.shuffleToggle(shuffle);
			this.onEnd_();
		});

		this.$('audio').addEventListener('timeupdate', () => this.onTimeChange_());
		this.$('audio').addEventListener('ended', () => this.onEnd_());
		this.$('#volume-bar').addEventListener('progress-set', ({detail}) => this.onSetVolume_(detail));
		this.$('#time-bar').addEventListener('progress-set', ({detail}) => this.onSetTime_(detail));
		this.$('#prev').addEventListener('click', () => this.onPrev_());
		this.$('#pause').addEventListener('change', ({detail}) => this.onPauseToggle_(detail));
		this.$('#next').addEventListener('click', () => this.onEnd_());
		this.$('#shuffle').addEventListener('change', ({detail}) => this.onShuffleToggle_(detail));

		document.addEventListener('keydown', e => {
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
					this.$('#shuffle').change();
					break;
				case 'ArrowDown':
				case ' ':
					this.onPauseToggle_(this.$('#pause').checked = !this.$('#pause').checked);
					break;
			}
		});
	}

	get src() {
		return this.getAttribute('src');
	}

	set src(value) {
		this.setAttribute('src', value);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'src') {
			this.$('audio').src = path.resolve(storage.getSongDir(), newValue);
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

	onPauseToggle_(play) {
		if (!play)
			this.$('audio').pause();
		else
			this.play_();
	}

	onShuffleToggle_(shuffle) {
		this.shuffleToggle(shuffle);
		this.savePlayerSettings_();
	}

	shuffleToggle(shuffle) {
		this.dispatchEvent(new CustomEvent('shuffle', {detail: shuffle}));
		this.$('#shuffle').checked = shuffle;
	}

	play_() {
		this.$('audio').play().catch(e => console.error('err playing', e));
	}

	savePlayerSettings_() {
		storage.savePlayerSettings({
			volume: this.$('audio').volume,
			shuffle: this.$('#shuffle').checked,
		});
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
