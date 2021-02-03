const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const storage = require('../../service/storage');
const shortcuts = require('../../service/shortcuts');
const {ipcRenderer: ipc, shell} = require('electron');
const dwytpl = require('dwytpl');

customElements.define(name, class extends XElement {
	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		storage.fullscreenPreference.then(fullscreen => {
			if (fullscreen)
				this.toggleFullscreen_();
		});

		this.frames_ = [
			this.$('#stream-frame'),
			this.$('#downloader-frame'),
			this.$('#explorer-frame'),
		];

		this.selects_ = [
			this.$('#stream-select'),
			this.$('#downloader-select'),
			this.$('#explorer-select'),
		];

		this.selects_.forEach((select, i) => select.addEventListener('change', () => this.onSelect_(i)));

		this.$('#stream-frame').addEventListener('player-play', () => this.onPlayerPlay_(this.$('#explorer-frame')));
		this.$('#stream-frame').addEventListener('related-song', ({detail}) => this.onRelatedSong_(detail.id, detail.title));
		this.$('#stream-frame').addEventListener('link-song', ({detail}) => this.onLinkSong_(detail));

		this.$('#explorer-frame').addEventListener('player-play', () => this.onPlayerPlay_(this.$('#stream-frame')));

		this.$('#fullscreen').addEventListener('change', () => this.onFullscreenChange_());

		shortcuts.addListenerKeydown(this.handleKeypress_.bind(this));

		this.onSelect_(0);
	}

	onSelect_(index) {
		this.selects_.forEach((item, i) => item.checked = i === index);
		this.frames_.forEach((item, i) => item.classList.toggle('hidden-frame', i !== index));

		let explorerFrameSelected = this.frames_[index] === this.$('#explorer-frame');
		this.$('#stream-frame').playerFocus = !explorerFrameSelected;
		this.$('#explorer-frame').playerFocus = explorerFrameSelected;
	}

	onFullscreenChange_() {
		ipc.send('fullscreen-request', this.$('#fullscreen').checked);
		storage.fullscreenPreference = this.$('#fullscreen').checked;
	}

	toggleFullscreen_() {
		this.$('#fullscreen').checked = !this.$('#fullscreen').checked;
		this.onFullscreenChange_();
	}

	onRelatedSong_(id, title) {
		let explorerFrameIndex = this.frames_.findIndex(frame => frame === this.$('#explorer-frame'));
		this.onSelect_(explorerFrameIndex);
		this.$('#explorer-frame').queryRelated(id, title);
	}

	onLinkSong_(id) {
		shell.openExternal(`https://www.youtube.com/watch?v=${id}`);
	}

	onPlayerPlay_(...notifyFrames) {
		notifyFrames.forEach(frame => frame.stopPlay());
	}

	handleKeypress_(e) {
		if (e.key >= 1 && e.key <= this.frames_.length)
			this.onSelect_(parseInt(e.key) - 1);
		else if (e.key === 'f')
			this.toggleFullscreen_()
	}
});
