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
		this.$('#remove').addEventListener('click', () => this.onRemove_());
	}

	set playlistId(value) {
		this.refresh();
	}

	async refresh() {
		this.playlist_ = playlistCache.getUncachedPlaylist(this.playlistId);
		this.syncher_ = new dwytpl.Syncher(this.playlist_.videos, storage.downloadDir, [storage.explorerDownloadDir], true);

		this.$('#refresh').classList.add('refreshing');
		this.$('#title').textContent = await this.playlist_.title;
		this.$('#count').textContent = await this.playlist_.length;
		this.$('#playlist-id').textContent = this.playlistId;
		this.$('#refresh').classList.remove('refreshing');
	}

	onRemove_() {
		this.remove();
		this.emit('removed');
	}
});
