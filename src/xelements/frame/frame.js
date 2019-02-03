const template = require('fs').readFileSync(`${__dirname}/frame.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-frame', class Frame extends XElement {
		constructor() {
			super(template);
		}

		connectedCallback() {
			this.frames_ = [
				this.$('#player-frame'),
				this.$('#list-frame'),
				this.$('#downloader-frame')];

			this.selects_ = [
				this.$('#player-select'),
				this.$('#list-select'),
				this.$('#downloader-select')];

			this.selects_.forEach((select, i) => select.addEventListener('change', () => this.onSelect_(i)));

			this.$('#list-frame').addEventListener('select-song', ({detail}) => this.onSelectSong_(detail));
			this.$('#list-frame').addEventListener('remove-song', ({detail}) => this.onRemoveSong_(detail));

			this.onSelect_(0);
		}

		onSelect_(index) {
			this.selects_.forEach((item, i) => item.checked = i === index);
			this.frames_.forEach((item, i) => item.classList.toggle('hidden-frame', i !== index));
		}

		onSelectSong_(index) {
			this.$('#player-frame').setSong(index);
		}

		onRemoveSong_(index) {
			console.log('remove song')
			// this.$('#player-frame').setSong(index);
		}
	}
);
