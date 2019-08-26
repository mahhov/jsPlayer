const template = require('fs').readFileSync(`${__dirname}/audioVisualizer.html`, 'utf8');
const XElement = require('../XElement');
const Visualizer = require('../../service/visualizer');

const BAR_COUNT = 32 * 4;

customElements.define('x-audio-visualizer', class extends XElement {
	static get observedAttributes() {
		return ['width', 'height'];
	}

	constructor() {
		super(template);
	}

	connectedCallback() {
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

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case 'width':
				this.$('#canvas').width = newValue;
				this.newVisualizer_();
				break;
			case 'height':
				this.$('#canvas').height = newValue;
				this.newVisualizer_();
				break;
		}
	}

	updateVisualizer_() {
		this.frequencyData_ = this.frequencyData_ || new Uint8Array(BAR_COUNT);
		if (!this.analyzer_ || !this.visualizer_)
			return;
		this.analyzer_.getByteFrequencyData(this.frequencyData_);
		this.visualizer_.draw([...this.frequencyData_].map(v => v / 255));
		requestAnimationFrame(() => this.updateVisualizer_());
	}

	newVisualizer_() {
		let canvas = this.$('#canvas');
		let canvasCtx = canvas.getContext('2d');
		this.visualizer_ = new Visualizer(canvas.width, canvas.height, canvasCtx, BAR_COUNT);
		this.updateVisualizer_();
		// todo update Visualizer so that we can update it's dimensions without creating a brand new visualizer
	}
});
