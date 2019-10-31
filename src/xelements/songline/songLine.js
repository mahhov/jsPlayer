const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {
			number: false,
			title: false,
			favorited: true,
			selected: true,
		};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		if (!this.hasAttribute('number'))
			this.setAttribute('number', 0);
		if (!this.hasAttribute('title'))
			this.setAttribute('title', '');

		this.$('#favorite').addEventListener('change', () => this.emitFavorite_());
		this.$('#link').addEventListener('click', e => this.emitLink_(e));
		this.$('#remove').addEventListener('click', e => this.emitRemove_(e));
		this.$('#container').addEventListener('click', () => this.emitSelect_());
	}

	set number(value) {
		this.$(`#number`).textContent = value;
	}

	set title(value) {
		this.$(`#title`).textContent = value;
	}

	set favorited(value) {
		this.$('#favorite').checked = value;
	}

	set selected(value) {
		this.$('#container').classList.toggle('selected', value);
	}

	get text() {
		return `${this.number} ${this.title}`;
	}

	emitFavorite_() {
		this.favorited = this.$('#favorite').checked;
		this.emit('favorite', this.$('#favorite').checked);
	}

	emitLink_(e) {
		e.stopPropagation(); // prevent emitSelect
		this.emit('link');
	}

	emitRemove_(e) {
		e.stopPropagation(); // prevent emitSelect
		this.emit('remove');
	}

	emitSelect_() {
		this.emit('select');
	}
});
