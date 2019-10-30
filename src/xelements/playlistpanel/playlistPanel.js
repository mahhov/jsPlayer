const template = require('fs').readFileSync(`${__dirname}/playlistPanel.html`, 'utf8');
const XElement = require('../XElement');
const dwytpl = require('dwytpl');
const playlistCache = require('../../service/playlistCache');
const storage = require('../../service/storage');

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

	async refresh() {
		this.playlist_ = playlistCache.getUncachedPlaylist(this.playlistId);
		this.syncher_ = new dwytpl.Syncher(this.playlist_, storage.downloadDir, [storage.explorerDownloadDir], true);

		({
			title: this.$('#title').textContent,
			length: this.$('#count').textContent
		} = await this.playlist_.getOverview());
		this.$('#playlist-id').textContent = this.playlistId;
	}

	onDownload_() {
		this.syncher_.download();
		this.emit('download', this.syncher_.tracker);
	}

	stopDownload() {
		this.syncher_.stopDownload(true);
	}

	onRemove_() {
		this.remove();
		this.emit('removed');
	}
});
