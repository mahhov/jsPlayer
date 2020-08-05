const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {
			title: false,
			selected: true,
			status: false,
			downloadStatus: false,
		};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		this.$('#related').addEventListener('click', e => {
			e.stopPropagation(); // prevent emitSelect
			this.emit('related');
		});
		this.$('#link').addEventListener('click', e => {
			e.stopPropagation(); // prevent emitSelect
			this.emit('link');
		});
		this.$('#container').addEventListener('click', () => this.emit('select'));
	}

	set title(value) {
		this.$('#title').textContent = value;
	}

	set selected(value) {
		this.$('#container').classList.toggle('selected', value);
	}

	set status(value) {
		this.$('#download-icon').title = value;
	}

	set downloadStatus(value) {
		this.$('#container').classList.toggle('download-success', value === 'true');
		this.$('#container').classList.toggle('download-fail', value === 'false');
	}
});
