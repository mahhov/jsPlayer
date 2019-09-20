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
			.map(propName => XElement.propToAttribName(propName));
	}

	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.innerHTML = this.constructor.htmlTemplate;

		let properties = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this));
		Object.entries(this.constructor.attributeTypes).forEach(([propName, boolean]) => {
			let attribName = XElement.propToAttribName(propName);
			Object.defineProperty(this, XElement.setterName(propName), properties[propName] || {set: () => 0});
			Object.defineProperty(this, propName, boolean ? {
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

	attributeChangedCallback(attribName, oldValue, newValue) {
		let propName = XElement.attribToPropName(attribName);
		if (this.constructor.attributeTypes[propName])
			this[XElement.setterName(propName)] = this.hasAttribute(attribName);
		else
			this[XElement.setterName(propName)] = newValue;
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

	static propToAttribName(propName) {
		return propName.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`);
	}

	static attribToPropName(attribname) {
		return attribname.replace(/-(.)/g, (_, a) => a.toUpperCase());
	}

	static setterName(propName) {
		return `xel2_${propName}_`;
	}
}

module.exports = XElement;
