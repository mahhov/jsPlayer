const template = require('fs').readFileSync(`${__dirname}/progressbar.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-progress-bar', class extends XElement {
		static get observedAttributes() {
			return ['pre-value', 'post-value', 'progress'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			this.$('#progress').addEventListener('click', e => this.onProgressClick_(e))
		}

		get preValue() {
			return this.getAttribute('pre-value');
		}

		set preValue(value) {
			this.setAttribute('pre-value', value);
		}

		get postValue() {
			return this.getAttribute('post-value');
		}

		set postValue(value) {
			this.setAttribute('post-value', value);
		}

		get progress() {
			return this.getAttribute('progress');
		}

		set progress(value) {
			this.setAttribute('progress', value);
		}

		attributeChangedCallback(name, oldValue, newValue) {
			if (name === 'progress')
				this.$('#fill').style.width = newValue * 100 + '%';
			else
				this.$(`#${name}`).textContent = newValue;
		}

		onProgressClick_({offsetX}) {
			let percentage = offsetX / this.$(`#progress`).clientWidth;
			this.dispatchEvent(new CustomEvent('progress-set', {detail: percentage}));
		}
	}
);
