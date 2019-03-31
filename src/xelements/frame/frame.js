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
				this.$('#player-frame'),
				this.$('#list-frame'),
				this.$('#downloader-frame')];

			this.selects_ = [
				this.$('#player-select'),
				this.$('#list-select'),
				this.$('#downloader-select')];

			this.selects_.forEach((select, i) => select.addEventListener('change', () => this.onSelect_(i)));

			this.$('#player-frame').addEventListener('remove-song', ({detail}) => this.onRemoveSong_(detail));
			this.$('#player-frame').addEventListener('playing-song', ({detail}) => this.onPlayingSong_(detail));
			this.$('#list-frame').addEventListener('select-song', ({detail}) => this.onSelectSong_(detail));
			this.$('#list-frame').addEventListener('remove-song', ({detail}) => this.onRemoveSong_(detail));

			this.$('#fullscreen').addEventListener('change', ({detail}) => ipc.send('fullscreen-request', detail));

			shortcuts.addListenerKeydown(this.handleKeypress_.bind(this));

			this.onSelect_(0);
		}

		onSelect_(index) {
			this.selects_.forEach((item, i) => item.checked = i === index);
			this.frames_.forEach((item, i) => item.classList.toggle('hidden-frame', i !== index));
		}

		onSelectSong_(index) {
			this.$('#player-frame').setSong(index);
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
		}
	}
);
