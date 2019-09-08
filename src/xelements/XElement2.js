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
		return Object.keys(this.attributeTypes)
			.map(name => XElement.propToAttribName(name));
	}

	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.innerHTML = this.constructor.htmlTemplate;

		let properties = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this));
		Object.entries(this.constructor.attributeTypes).forEach(([name, boolean]) => {
			let attribName = XElement.propToAttribName(name);
			Object.defineProperty(this, `${name}_`, properties[name] || {set: () => 0});
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
		let propName = XElement.attribToPropName(name);
		if (this.constructor.attributeTypes[name])
			this[`${propName}_`] = this.hasAttribute(name);
		else
			this[`${propName}_`] = newValue;
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

	static propToAttribName(name) {
		return name.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`);
	}

	static attribToPropName(name) {
		return name.replace(/-(.)/g, (_, a) => a.toUpperCase());
	}
}

module.exports = XElement;
