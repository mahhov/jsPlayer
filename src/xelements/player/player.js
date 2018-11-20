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
			this.$('audio').addEventListener('timeupdate', () => this.onProgressChange_());
			this.$('audio').addEventListener('ended', this.onEnded_.bind(this));

			this.$('#time-bar').addEventListener('progress-set', ({detail}) => this.onSetProgress_(detail));
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

		onProgressChange_() {
			let {currentTime, duration} = this.$('audio');
			this.$('#time-bar').progress = currentTime / duration;
			this.$('#time-bar').preValue = Player.timeFormat(currentTime);
			this.$('#time-bar').postValue = Player.timeFormat(duration);
		}

		onEnded_() {
			this.dispatchEvent(new CustomEvent('ended'));
		}

		onSetProgress_(progress) {
			this.$('audio').currentTime = progress * this.$('audio').duration;
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