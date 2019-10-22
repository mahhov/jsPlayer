const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);

customElements.define(name, class extends XElement {
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
		this.emit('change', this.checked);
	}
});
