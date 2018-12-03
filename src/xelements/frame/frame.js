const template = require('fs').readFileSync(`${__dirname}/frame.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-frame', class Frame extends XElement {
		constructor() {
			super(template);
		}

		connectedCallback() {
			this.frames = [
				this.$('#player-frame'),
				this.$('#list-frame'),
				this.$('#downloader-frame')];

			this.selects = [
				this.$('#player-select'),
				this.$('#list-select'),
				this.$('#downloader-select')];

			this.selects.forEach((select, i) => select.addEventListener('change', () => this.onSelect_(i)))

			this.onSelect_(0);
		}

		onSelect_(index) {
			this.selects.forEach((item, i) => item.checked = i === index);
			this.frames.forEach((item, i) => item.classList.toggle('hidden-frame', i !== index));
		}
	}
);
