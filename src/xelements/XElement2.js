class XElement extends HTMLElement {
	static get attributeTypes() {
		return {};
		/* override */
	}

	static get htmlTemplate() {
		return '';
		/* override */
	}

	static get observedAttributes() {
		return Object.keys(this.attributeTypes);
	}

	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.innerHTML = this.constructor.htmlTemplate;

		let properties = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this));
		Object.entries(this.constructor.attributeTypes).forEach(([name, boolean]) => {
			let attribName = name.replace(/[A-Z]/g, a => `_${a.toLowerCase()}`);
			Object.defineProperty(this, `${name}_`, properties[name]);
			Object.defineProperty(this, name, boolean ? {
				get: () => this.hasAttribute(attribName),
				set: value => value ?
					this.setAttribute(attribName, '') :
					this.removeAttribute(attribName)
			} : {
				get: () => this.getAttribute(attribName),
				set: value => this.setAttribute(attribName, value)
			});
		});

	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (this.constructor.attributeTypes[name])
			this[`${name}_`] = this.hasAttribute(name);
		else
			this[`${name}_`] = newValue;
	}

	$(query) {
		return this.shadowRoot.querySelector(query);
	}

	$$(query) {
		return this.shadowRoot.querySelectorAll(query);
	}

	static clearChildren(element) {
		while (element.firstChild)
			element.removeChild(element.firstChild);
	}
}

module.exports = XElement;
