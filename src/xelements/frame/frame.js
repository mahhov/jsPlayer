const template = require('fs').readFileSync(`${__dirname}/frame.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-frame', class Frame extends XElement {
		constructor() {
			super(template);
		}

		connectedCallback() {
			this.$('#player').addEventListener('change', () => this.onSelect_(0));
			this.$('#list').addEventListener('change', () => this.onSelect_(1));
			this.$('#downloader').addEventListener('change', () => this.onSelect_(2));
		}

		onSelect_(index) {
			[this.$('#player'), this.$('#list'), this.$('#downloader')]
				.forEach((item, i) => item.checked = i === index);
		}
	}
);
