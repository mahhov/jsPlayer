const template = require('fs').readFileSync(`${__dirname}/player.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-player', class Player extends XElement {
		static get observedAttributes() {
			return ['src'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			this.onVolumeChange_();
			this.$('audio').addEventListener('volumechange', () => this.onVolumeChange_());
			this.$('audio').addEventListener('timeupdate', () => this.onTimeChange_());
			this.$('audio').addEventListener('ended', this.onEnded_.bind(this));
			this.$('#volume-bar').addEventListener('progress-set', ({detail}) => this.onSetVolume_(detail));
			this.$('#time-bar').addEventListener('progress-set', ({detail}) => this.onSetTime_(detail));
		}

		get src() {
			return this.getAttribute('src');
		}

		set src(value) {
			this.setAttribute('src', value);
		}

		attributeChangedCallback(name, oldValue, newValue) {
			if (name === 'src')
				this.$('audio').src = newValue;
		}

		onVolumeChange_() {
			let {volume} = this.$('audio');
			this.$('#volume-bar').progress = volume;
			this.$('#volume-bar').preValue = Player.volumeFormat(volume);
		}

		onTimeChange_() {
			let {currentTime, duration} = this.$('audio');
			this.$('#time-bar').progress = currentTime / duration;
			this.$('#time-bar').preValue = Player.timeFormat(currentTime);
			this.$('#time-bar').postValue = Player.timeFormat(duration);
		}

		onEnded_() {
			this.dispatchEvent(new CustomEvent('ended'));
		}

		onSetVolume_(volume) {
			volume = Math.round(volume * 20) / 20;

			const THRESHOLD = .15;
			if (volume < THRESHOLD)
				volume = 0;
			if (volume > 1 - THRESHOLD)
				volume = 1;

			this.$('audio').volume = volume;
		}

		onSetTime_(time) {
			this.$('audio').currentTime = time * this.$('audio').duration;
		}

		static volumeFormat(volume) {
			return Player.num2str((volume * 100).toFixed(0), 2);
		}

		static timeFormat(seconds) {
			seconds = parseInt(seconds);
			let remainderSeconds = Player.num2str(seconds % 60, 2);
			let minutes = Player.num2str(seconds - remainderSeconds);
			return `${minutes}:${remainderSeconds}`;
		}

		static num2str(number, length) {
			return number.toString().padStart(length, 0);
		}
	}
);