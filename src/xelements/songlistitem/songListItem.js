const template = require('fs').readFileSync(`${__dirname}/songListItem.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-song-list-item', class extends XElement {
		static get observedAttributes() {
			return ['number', 'title'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			if (!this.hasAttribute('number'))
				this.setAttribute('number', 0);
			if (!this.hasAttribute('title'))
				this.setAttribute('title', '');
		}

		disconnectedCallback() {
			this.$('#remove').removeEventListener('click', this.onRemove_);
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

		attributeChangedCallback(name, oldValue, newValue) {
			this.$(`#${name}`).textContent = newValue;
		}
	}
);