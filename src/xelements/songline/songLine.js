const template = require('fs').readFileSync(`${__dirname}/songLine.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-song-line', class extends XElement {
		static get observedAttributes() {
			return ['number', 'title', 'selected'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			if (!this.hasAttribute('number'))
				this.setAttribute('number', 0);
			if (!this.hasAttribute('title'))
				this.setAttribute('title', '');

			this.$('.container').addEventListener('click', () => this.emitSelect_());
			this.$('#remove').addEventListener('click', e => this.emitRemove_(e));
		}

		get number() {
			return this.getAttribute('number');
		}

		set number(value) {
			this.setAttribute('number', value);
		}

		get title() {
			return this.getAttribute('title');
		}

		set title(value) {
			this.setAttribute('title', value);
		}

		get selected() {
			return this.hasAttribute('selected');
		}

		set selected(value) {
			if (value)
				this.setAttribute('selected', '');
			else
				this.removeAttribute('selected');
		}

		get text() {
			return `${this.number} ${this.title}`;
		}

		attributeChangedCallback(name, oldValue, newValue) {
			if (name === 'selected')
				this.$('p').classList.toggle('selected', this.hasAttribute('selected'));
			else
				this.$(`#${name}`).textContent = newValue;
		}

		emitSelect_() {
			this.dispatchEvent(new CustomEvent('select'));
		}

		emitRemove_(e) {
			e.stopPropagation(); // prevent emitSelect
			this.dispatchEvent(new CustomEvent('remove'));
		}
	}
);
