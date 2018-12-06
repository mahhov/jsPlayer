const template = require('fs').readFileSync(`${__dirname}/playlistPanelItem.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-playlist-panel-item', class extends XElement {
		static get observedAttributes() {
			return ['title', 'count', 'id'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			if (!this.hasAttribute('title'))
				this.setAttribute('title', '');
			if (!this.hasAttribute('count'))
				this.setAttribute('count', 0);
			if (!this.hasAttribute('id'))
				this.setAttribute('id', '');

			this.$('#synch').addEventListener('click', () => this.onSynch_())
		}

		get title() {
			return this.getAttribute('title');
		}

		set title(value) {
			this.setAttribute('title', value);
		}

		get count() {
			return this.getAttribute('count');
		}

		set count(value) {
			this.setAttribute('count', value);
		}

		get id() {
			return this.getAttribute('id');
		}

		set id(value) {
			this.setAttribute('id', value);
		}

		attributeChangedCallback(name, oldValue, newValue) {
			this.$(`#${name}`).textContent = newValue;
		}

		onSynch_() {
			this.dispatchEvent(new CustomEvent('synch'));
		}
	}
);
