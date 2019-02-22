const template = require('fs').readFileSync(`${__dirname}/audioVisualizer.html`, 'utf8');
const XElement = require('../XElement');
const audio = require('../../service/audio');

class Visualizer {
	constructor(width, height, canvasCtx, barCount) {
		this.width_ = width;
		this.height_ = height;
		this.canvasCtx_ = canvasCtx;
		this.smoothValues_ = Array(barCount).fill(0);

		this.clearColor = [0, 0, 0];
		this.leftColor = [255, 0, 0];
		this.rightColor = [0, 0, 255];
		this.leftSmoothColor = [255, 150, 100];
		this.rightSmoothColor = [100, 150, 255];
		this.blurColor = [200, 100, 200];
		this.smoothWeight = .98;
		this.blur = .05;

		this.xMargin_ = this.width_ * .03;
		this.yMargin_ = this.height_ * .1;
		this.barSpace_ = (this.width_ - this.xMargin_ * 2) / barCount;
		this.barWidth_ = this.barSpace_ * .75;
		this.minBarHeight_ = this.height_ * .01;
		this.maxBarHeight_ = (this.height_ - this.minBarHeight_ - this.yMargin_ * 2) * (1 - this.blur)
	}

	static averageColor(c1, c2, weight) {
		return Visualizer.rgb(...c1.map((c, i) => c * (1 - weight) + c2[i] * weight));
	}

	static rgb(r, g, b) {
		return `rgb(${r}, ${g}, ${b})`;
	}

	draw(values) {
		this.smoothValues_ = this.smoothValues_.map((value, i) =>
			value * this.smoothWeight + values[i] * (1 - this.smoothWeight));

		this.canvasCtx_.fillStyle = Visualizer.rgb(...this.clearColor);
		this.canvasCtx_.fillRect(0, 0, this.width_, this.height_);

		values.forEach((value, i) => {
			let gradiant = i / values.length;
			let barHeight = value * this.maxBarHeight_ + this.minBarHeight_;
			let left = i * this.barSpace_ + this.xMargin_ + (this.barSpace_ - this.barWidth_) / 2;
			let top = this.height_ - barHeight - this.yMargin_;
			let smoothHeight = (this.smoothValues_[i] - value) * this.maxBarHeight_;
			let blurHeight = barHeight * this.blur;

			this.canvasCtx_.fillStyle = Visualizer.averageColor(this.leftSmoothColor, this.rightSmoothColor, gradiant);
			this.canvasCtx_.fillRect(left, top - smoothHeight, this.barWidth_, smoothHeight);

			this.canvasCtx_.fillStyle = Visualizer.averageColor(this.leftColor, this.rightColor, gradiant);
			this.canvasCtx_.fillRect(left, top, this.barWidth_, barHeight);

			this.canvasCtx_.fillStyle = Visualizer.rgb(...this.blurColor);
			this.canvasCtx_.fillRect(left, top - blurHeight, this.barWidth_, blurHeight);
		});
	}
}

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
