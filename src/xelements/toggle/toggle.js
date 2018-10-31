let template = require('fs').readFileSync(`${__dirname}/toggle.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-toggle', class extends XElement {
	constructor() {
		super(template);
	}
});
