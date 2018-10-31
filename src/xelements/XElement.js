class XElement extends HTMLElement {
	constructor(htmlString) {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.innerHTML = htmlString;
	}
}

module.exports = XElement;