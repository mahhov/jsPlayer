const template = require('fs').readFileSync(`${__dirname}/player.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-player', class extends XElement {
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
			this.$('#time-bar').preValue = this.constructor.timeFormat(currentTime);
			this.$('#time-bar').postValue = this.constructor.timeFormat(duration);
		}

		onEnded_() {
			this.dispatchEvent(new CustomEvent('ended'));
		}

		onSetProgress_(progress) {
			this.$('audio').currentTime = progress * this.$('audio').duration;
		}

		static timeFormat(seconds) {
			seconds = parseInt(seconds);
			if (seconds < 60)
				return `${seconds}s`;
			let remainderSeconds = seconds % 60;
			let minutes = seconds - rseconds;
			return `${minutes}:${remainderSeconds}`;
		}
	}
);