const template = require('fs').readFileSync(`${__dirname}/playlistPanelOutput.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-playlist-panel-output', class extends XElement {
		constructor() {
			super(template);
		}

		connectedCallback() {
		}

		set plaoutputPrinter(value) {
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