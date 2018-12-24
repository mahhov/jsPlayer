const template = require('fs').readFileSync(`${__dirname}/fixedLinesDiv.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-fixed-line-div', class FixedLinesDiv extends XElement {
		static get observedAttributes() {
			return ['size'];
		}

		constructor() {
			super(template);
		}

		get size() {
			return this.getAttribute('size');
		}

		set size(value) {
			this.setAttribute('size', value);
		}

		get lines() {
			return this.lines_;
		}

		set lines(value) {
			this.lines_ = value;
			value.forEach((line, i) => this.linePres_[i].textContent = line);
		}

		attributeChangedCallback(name, oldValue, newValue) {
			switch (name) {
				case 'size':
					let size = Number(newValue);
					XElement.clearChildren(this.$('#div'));
					this.linePres_ = Array(size).fill(0).map(() => document.createElement('pre'));
					this.linePres_.forEach(pre => this.$('#div').appendChild(pre));
					break;
			}
		}
	}
);
