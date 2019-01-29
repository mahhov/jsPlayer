const template = require('fs').readFileSync(`${__dirname}/playlistPanel.html`, 'utf8');
const XElement = require('../XElement');
const dwytpl = require('dwytpl');
const storage = require('../../service/Storage');

customElements.define('x-playlist-panel', class extends XElement {
		static get observedAttributes() {
			return ['playlist-id'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			if (!this.hasAttribute('playlist-id'))
				this.setAttribute('playlist-id', '');

			this.$('#refresh').addEventListener('click', () => this.refresh());
			this.$('#download-toggle').addEventListener('change', ({detail: value}) =>
				value ? this.onDownload_() : this.stopDownload());
			this.$('#remove').addEventListener('click', () => this.onRemove_());
		}

		get playlistId() {
			return this.getAttribute('playlist-id');
		}

		set playlistId(value) {
			this.setAttribute('playlist-id', value);
		}

		attributeChangedCallback(name, oldValue, newValue) {
			this.playlistId_ = newValue;
			this.refresh();
		}

		refresh() {
			this.playlist_ = new dwytpl.Playlist(this.playlistId);
			this.syncher_ = new dwytpl.Syncher(this.playlist_);
			this.syncher_.setDownloadDir(storage.getSongDir());

			this.playlist_.getOverview().then(({title, length}) => {
				this.$('#title').textContent = title;
				this.$('#count').textContent = length;
			});
			this.$('#playlist-id').textContent = this.playlistId;
		}

		onDownload_() {
			this.syncher_.download();
			this.dispatchEvent(new CustomEvent('download', {detail: this.syncher_.tracker}));
		}

		stopDownload() {
			this.syncher_.stopDownload();
		}

		onRemove_() {
			this.remove();
			this.dispatchEvent(new CustomEvent('removed'));
		}
	}
);
