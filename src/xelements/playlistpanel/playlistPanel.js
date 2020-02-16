const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const dwytpl = require('dwytpl');
const playlistCache = require('../../service/playlistCache');
const storage = require('../../service/storage');

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {playlistId: false};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		if (!this.hasAttribute('playlist-id'))
			this.setAttribute('playlist-id', '');

		this.$('#refresh').addEventListener('click', () => this.refresh());
		this.$('#download-toggle').addEventListener('change', ({detail: value}) =>
			value ? this.onDownload_() : this.stopDownload());
		this.$('#remove').addEventListener('click', () => this.onRemove_());
	}

	set playlistId(value) {
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
		this.syncher_.download(10, {filter: 'audioonly'});
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
