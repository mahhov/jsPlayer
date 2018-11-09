const template = require('fs').readFileSync(`${__dirname}/player.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-player', class extends XElement {
		static get observedAttributes() {
			// return ['label', 'title'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			// if (!this.hasAttribute('number'))
			// 	this.setAttribute('number', 0);
			// if (!this.hasAttribute('title'))
			// 	this.setAttribute('title', '');
			//
			// this.$('#title').addEventListener('click', this.onSelect_); // todo need bind?
			// this.$('#remove').addEventListener('click', this.onRemove_); // todo need bind?
		}

		disconnectedCallback() {
			// this.$('#remove').removeEventListener('click', this.onRemove_);
		}

		get number() {
			// return this.getAttribute('number');
		}

		set number(value) {
			// this.setAttribute('number', value);
		}

		attributeChangedCallback(name, oldValue, newValue) {
			// this.$(`#${name}`).textContent = newValue;
		}

		onSelect_() {
			// this.dispatchEvent(new CustomEvent('select-song', {number: this.number, title: this.title}))
		}

		onRemove_() {
			// this.dispatchEvent(new CustomEvent('remove-song', {number: this.number, title: this.title}));
		}
	}
);