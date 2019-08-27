const template = require('fs').readFileSync(`${__dirname}/downloadingSongLine.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-downloading-song-line', class extends XElement {
		static get observedAttributes() {
			return ['title', 'status', 'selected'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			if (!this.hasAttribute('title'))
				this.setAttribute('title', '');
			if (!this.hasAttribute('status'))
				this.setAttribute('status', '');

			this.$('#container').addEventListener('click', () => this.emitSelect_());
		}

		get title() {
			return this.getAttribute('title');
		}

		set title(value) {
			this.setAttribute('title', value);
		}

		get status() {
			return this.getAttribute('status');
		}

		set status(value) {
			this.setAttribute('status', value);
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

		attributeChangedCallback(name, oldValue, newValue) {
			switch (name) {
				case 'title':
					this.$(`#title`).textContent = newValue;
					break;
				case 'status':
					this.$(`#status`).textContent = newValue;
					break;
				case 'selected':
					this.$('#container').classList.toggle('selected', this.hasAttribute('selected'));
					break;
			}
		}

		emitSelect_() {
			this.dispatchEvent(new CustomEvent('select'));
		}
	}
);
