const template = require('fs').readFileSync(`${__dirname}/audioVisualizer.html`, 'utf8');
const XElement = require('../XElement');
const audio = require('../../service/audio');
const Visualizer = require('../../service/visualizer');

customElements.define('x-audio-visualizer', class extends XElement {
	constructor() {
		super(template);
	}

	connectedCallback() {
		const BAR_COUNT = 32 * 4;

		let canvas = this.$('canvas');
		let canvasCtx = canvas.getContext('2d');
		let frequencyData = new Uint8Array(BAR_COUNT);

		let visualizer = new Visualizer(canvas.width, canvas.height, canvasCtx, BAR_COUNT);

		let updateVisualizer = () => {
			requestAnimationFrame(updateVisualizer);
			audio.audioAnalyzer.getByteFrequencyData(frequencyData);
			visualizer.draw([...frequencyData].map(v => v / 255));
		};


		updateVisualizer();
	}
});
