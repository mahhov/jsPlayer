const template = require('fs').readFileSync(`${__dirname}/toggle.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-toggle', class extends XElement {
	static get observedAttributes() {
		return ['checked'];
	}

	constructor() {
		super(template);
	}

	connectedCallback() {
		this.$('#checkbox').addEventListener('change', () => this.onChange_())
	}

	get checked() {
		return this.hasAttribute('checked');
	}

	set checked(value) {
		if (value)
			this.setAttribute('checked', '');
		else
			this.removeAttribute('checked');
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.$('#checkbox').checked = newValue === '';
	}

	onChange_() {
		this.dispatchEvent(new CustomEvent('change', {detail: this.checked}));
	}
});
