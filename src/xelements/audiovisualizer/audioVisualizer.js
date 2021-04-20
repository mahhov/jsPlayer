const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const Visualizer = require('../../service/Visualizer');

const BAR_COUNT = 32 * 4;

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {width: false, height: false, animate: true};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		this.docFocus_ = true;
		window.addEventListener('blur', () => this.docFocus_ = false);
		window.addEventListener('focus', () => {
			this.docFocus_ = true;
			this.updateVisualizer_();
		});

		if (!this.hasAttribute('width'))
			this.setAttribute('width', '1000');
		if (!this.hasAttribute('height'))
			this.setAttribute('height', '200');
		this.newVisualizer_();
	}

	set analyzer(analyzer) {
		this.analyzer_ = analyzer;
		this.updateVisualizer_();
	}

	set width(value) {
		this.$('#canvas').width = value;
		this.newVisualizer_();
	}

	set height(value) {
		this.$('#canvas').height = value;
		this.newVisualizer_();
	}

	set animate(value) {
		this.updateVisualizer_();
	}

	updateVisualizer_() {
		if (!this.animate || this.animationFramePending_ || !this.docFocus_)
			return;

		this.frequencyData_ = this.frequencyData_ || new Uint8Array(BAR_COUNT);
		if (!this.analyzer_ || !this.visualizer_)
			return;
		this.analyzer_.getByteFrequencyData(this.frequencyData_);
		this.visualizer_.draw([...this.frequencyData_].map(v => v / 255));

		this.animationFramePending_ = requestAnimationFrame(() => {
			this.animationFramePending_ = 0;
			this.updateVisualizer_();
		});
	}

	newVisualizer_() {
		let canvas = this.$('#canvas');
		let canvasCtx = canvas.getContext('2d');
		this.visualizer_ = new Visualizer(canvas.width, canvas.height, canvasCtx, BAR_COUNT);
		this.updateVisualizer_();
		// todo update Visualizer so that we can update it's dimensions without creating a brand new visualizer
	}
});
