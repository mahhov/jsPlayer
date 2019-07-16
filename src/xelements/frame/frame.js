const template = require('fs').readFileSync(`${__dirname}/frame.html`, 'utf8');
const XElement = require('../XElement');
const storage = require('../../service/Storage');
const shortcuts = require('../../service/shortcuts');
const {ipcRenderer: ipc} = require('electron');

customElements.define('x-frame', class Frame extends XElement {
		constructor() {
			super(template);
		}

		connectedCallback() {
			this.frames_ = [
				this.$('#play-frame'),
				this.$('#list-frame'),
				this.$('#downloader-frame')];

			this.selects_ = [
				this.$('#player-select'),
				this.$('#list-select'),
				this.$('#downloader-select')];

			this.selects_.forEach((select, i) => select.addEventListener('change', () => this.onSelect_(i)));

			this.$('#play-frame').addEventListener('favorite-song', ({detail: {name, favorite}}) => this.onFavoriteSong_(name, favorite));
			this.$('#play-frame').addEventListener('remove-song', ({detail}) => this.onRemoveSong_(detail));
			this.$('#play-frame').addEventListener('playing-song', ({detail}) => this.onPlayingSong_(detail));
			this.$('#list-frame').addEventListener('select-song', ({detail}) => this.onSelectSong_(detail));
			this.$('#list-frame').addEventListener('favorite-song', ({detail: {name, favorite}}) => this.onFavoriteSong_(name, favorite));
			this.$('#list-frame').addEventListener('remove-song', ({detail}) => this.onRemoveSong_(detail));

			this.$('#fullscreen').addEventListener('change', () => this.onFullscreenChange_());

			shortcuts.addListenerKeydown(this.handleKeypress_.bind(this));

			this.onSelect_(0);
		}

		onSelect_(index) {
			this.selects_.forEach((item, i) => item.checked = i === index);
			this.frames_.forEach((item, i) => item.classList.toggle('hidden-frame', i !== index));
		}

		onFullscreenChange_() {
			ipc.send('fullscreen-request', this.$('#fullscreen').checked);
		}

		onSelectSong_(index) {
			this.$('#play-frame').setSong(index);
		}

		onFavoriteSong_(name, favorite) {
			storage.setSongFavorite(name, favorite);
		}

		onRemoveSong_(name) {
			storage.removeSong(name);
		}

		onPlayingSong_(index) {
			this.$('#list-frame').selectSong(index);
		}

		handleKeypress_(e) {
			if (e.key >= 1 && e.key <= 3)
				this.onSelect_(parseInt(e.key) - 1);
			else if (e.key === 'f') {
				this.$('#fullscreen').checked = !this.$('#fullscreen').checked;
				this.onFullscreenChange_(this.$('#fullscreen').checked);
			}
		}
	}
);
