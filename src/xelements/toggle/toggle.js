const template = require('fs').readFileSync(`${__dirname}/toggle.html`, 'utf8');
const XElement = require('../XElement2');

customElements.define('x-toggle', class extends XElement {
	static get attributeTypes() {
		return {checked: true};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		this.$('#checkbox').addEventListener('change', () => this.onChange_());
		this.$('label').addEventListener('click', e => e.stopPropagation());
	}

	set checked(value) {
		this.$('#checkbox').checked = value;
	}

	onChange_() {
		this.checked = this.$('#checkbox').checked;
		this.dispatchEvent(new CustomEvent('change', {detail: this.checked}));
	}
});
