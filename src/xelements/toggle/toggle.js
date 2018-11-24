const template = require('fs').readFileSync(`${__dirname}/toggle.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-toggle', class extends XElement {
	constructor() {
		super(template);
	}

	connectedCallback() {
		this.$('#checkbox').addEventListener('change', () => this.onChange_())
	}

	onChange_() {
		this.dispatchEvent(new CustomEvent('change', {detail: this.$('#checkbox').checked}));
	}
});
