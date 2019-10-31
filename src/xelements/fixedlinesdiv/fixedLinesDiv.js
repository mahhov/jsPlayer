const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {size: false};
	}

	static get htmlTemplate() {
		return template;
	}

	get lines() {
		return this.lines_;
	}

	set lines(value) {
		this.size = value.length;
		this.lines_ = value;
		value.forEach((line, i) => this.linePres_[i].textContent = line);
	}

	set size(value) {
		let size = Number(value);
		XElement.clearChildren(this.$('#div'));
		this.linePres_ = Array(size).fill(0).map(() => document.createElement('pre'));
		this.linePres_.forEach(pre => this.$('#div').appendChild(pre));
	}
});
