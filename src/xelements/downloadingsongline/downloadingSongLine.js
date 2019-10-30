const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const playlistCache = require('../../service/playlistCache');
const authYoutubeApi = require('../../service/authYoutubeApi');
const storage = require('../../service/storage');

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {
			videoId: false,
			title: false,
			status: false,
			playlistStatus: false,
			downloadStatus: false,
			playStatus: false,
		};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		// todo move default initializations to XElement2
		if (this.playlistStatus === null)
			this.playlistStatus = 'undetermined';
		if (this.downloadStatus === null)
			this.downloadStatus = 'undetermined';
		if (this.playStatus === null)
			this.playStatus = 'undetermined';
		this.$('#add').addEventListener('click', e => this.add_(e));
		this.$('#remove').addEventListener('click', e => this.remove_(e));
		this.$('#container').addEventListener('click', () => this.emitSelect_());
	}

	async checkPlaylistStatus_() {
		let playlistItemIdsPromises = (await storage.playlistList).map(playlistId =>
			authYoutubeApi.includes(playlistId, this.videoId));
		this.playlistItemIds_ = (await Promise.all(playlistItemIdsPromises)).flat();
		// todo implement Promise.any instead of .all
		this.playlistStatus = !!this.playlistItemIds_.length;
	}

	set videoId(value) {
		this.playlistStatus = 'undetermined';
		this.checkPlaylistStatus_();
	}

	set title(value) {
		this.$(`#title`).textContent = value;
	}

	set status(value) {
		this.$(`#status`).textContent = value;
	}

	set playlistStatus(value) {
		this.$('#container').classList.toggle('playlist-added', value === 'true');
		this.$('#container').classList.toggle('playlist-not-added', value === 'false');
		this.$('#container').classList.toggle('playlist-undetermined', value === 'undetermined');
	}

	set downloadStatus(value) {
		this.$('#container').classList.toggle('disabled', value !== 'true'); // for element.css
		this.$('#container').classList.toggle('download-success', value === 'true');
		this.$('#container').classList.toggle('download-fail', value === 'false');
		this.$('#container').classList.toggle('download-undetermined', value === 'undetermined');
	}

	set playStatus(value) {
		this.$('#container').classList.toggle('selected', value === 'true'); // for element.css
		this.$('#container').classList.toggle('play-playing', value === 'true');
		this.$('#container').classList.toggle('play-played', value === 'false');
		this.$('#container').classList.toggle('play-unplayed', value === 'undetermined');
	}

	async add_(e) {
		e.stopPropagation(); // prevent emitSelect
		this.playlistStatus = 'undetermined';
		// todo allow adding to any playlist
		await authYoutubeApi.add('PLameShrvoeYdaXeCaQoiFwXhlEu25USlc', this.videoId);
		await this.checkPlaylistStatus_();
		this.emit('playlist-status-changed', true);
	}

	async remove_(e) {
		e.stopPropagation(); // prevent emitSelect
		this.playlistStatus = 'undetermined';
		// todo bug with youtube api not allowing removing multiple instances of same video simultaneously
		await Promise.all(this.playlistItemIds_.map(playlistItemId => authYoutubeApi.remove(playlistItemId)));
		await this.checkPlaylistStatus_();
		this.emit('playlist-status-changed', false);
	}

	emitSelect_() {
		if (this.downloadStatus === 'true')
			this.emit('select');
	}
});
