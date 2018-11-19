const template = require('fs').readFileSync(`${__dirname}/progressbar.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-progress-bar', class extends XElement {
		static get observedAttributes() {
			return ['value-pre', 'value-post', 'progress'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			this.$('#progress').addEventListener('click', this.onProgressClick_.bind(this))
		}

		get valuePre() {
			return this.getAttribute('value-pre');
		}

		set valuePre(value) {
			this.setAttribute('value-pre', value);
		}

		get valuePost() {
			return this.getAttribute('value-post');
		}

		set valuePost(value) {
			this.setAttribute('value-post', value);
		}

		get progress() {
			return this.getAttribute('progress');
		}

		set progress(value) {
			this.setAttribute('progress', value);
		}

		attributeChangedCallback(name, oldValue, newValue) {
			if (name === 'progress')
				this.$('#progress-fill').style.width = newValue + '%';
			else
				this.$(`#${name}`).textContent = newValue;
		}

		onProgressClick_({offsetX}) {
			let percentage = offsetX / this.$(`#progress`).clientWidth;
			this.dispatchEvent(new CustomEvent('progress-set', {detail: percentage}));
		}
	}
);