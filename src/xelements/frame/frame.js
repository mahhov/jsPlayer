const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const storage = require('../../service/storage');
const shortcuts = require('../../service/shortcuts');
const {ipcRenderer: ipc, shell} = require('electron');

customElements.define(name, class extends XElement {
	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		storage.playerSettings.then(({fullscreen}) => {
			if (fullscreen)
				this.toggleFullscreen_();
		});

		this.frames_ = [
			this.$('#play-frame'),
			this.$('#list-frame'),
			this.$('#downloader-frame'),
			this.$('#explorer-frame'),
		];

		this.selects_ = [
			this.$('#player-select'),
			this.$('#list-select'),
			this.$('#downloader-select'),
			this.$('#explorer-select'),
		];

		this.selects_.forEach((select, i) => select.addEventListener('change', () => this.onSelect_(i)));

		this.$('#play-frame').addEventListener('favorite-song', ({detail: {name, favorite}}) => this.onFavoriteSong_(name, favorite));
		this.$('#play-frame').addEventListener('link-song', ({detail}) => this.onLinkSong_(detail));
		this.$('#play-frame').addEventListener('playing-song', ({detail}) => this.onPlayingSong_(detail));
		this.$('#play-frame').addEventListener('player-play', () => this.onPlayerPlay_(this.$('#explorer-frame')));
		this.$('#list-frame').addEventListener('select-song', ({detail}) => this.onSelectSong_(detail));
		this.$('#list-frame').addEventListener('favorite-song', ({detail: {name, favorite}}) => this.onFavoriteSong_(name, favorite));
		this.$('#list-frame').addEventListener('link-song', ({detail}) => this.onLinkSong_(detail));
		this.$('#list-frame').addEventListener('remove-song', ({detail}) => this.onRemoveSong_(detail));
		this.$('#explorer-frame').addEventListener('player-play', () => this.onPlayerPlay_(this.$('#play-frame')));

		this.$('#fullscreen').addEventListener('change', () => this.onFullscreenChange_());

		shortcuts.addListenerKeydown(this.handleKeypress_.bind(this));

		this.onSelect_(0);
	}

	onSelect_(index) {
		this.selects_.forEach((item, i) => item.checked = i === index);
		this.frames_.forEach((item, i) => item.classList.toggle('hidden-frame', i !== index));

		let explorerFrameSelected = this.frames_[index] === this.$('#explorer-frame');
		this.$('#play-frame').playerFocus = !explorerFrameSelected;
		this.$('#explorer-frame').playerFocus = explorerFrameSelected;
	}

	onFullscreenChange_() {
		ipc.send('fullscreen-request', this.$('#fullscreen').checked);
		storage.addPlayerSettings({fullscreen: this.$('#fullscreen').checked});
	}

	toggleFullscreen_() {
		this.$('#fullscreen').checked = !this.$('#fullscreen').checked;
		this.onFullscreenChange_();
	}

	onSelectSong_(index) {
		this.$('#play-frame').setSong(index, true);
	}

	async onFavoriteSong_(name, favorite) {
		await storage.setSongFavorite(name, favorite);
		this.$('#play-frame').updateFavoriteStatus();
		this.$('#list-frame').updateFavoriteStatus();
	}

	onLinkSong_(name) {
		let id = name.match(/-([^.]*)./)[1];
		shell.openExternal(`https://www.youtube.com/watch?v=${id}`);
	}

	onRemoveSong_(name) {
		storage.removeSong(name);
	}

	onPlayingSong_(index) {
		this.$('#list-frame').selectSong(index);
	}

	onPlayerPlay_(notifyFrame) {
		notifyFrame.stopPlay();
	}

	handleKeypress_(e) {
		if (e.key >= 1 && e.key <= this.frames_.length)
			this.onSelect_(parseInt(e.key) - 1);
		else if (e.key === 'f')
			this.toggleFullscreen_()
	}
});
