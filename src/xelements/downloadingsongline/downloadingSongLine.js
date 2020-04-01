const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const authYoutubeApi = require('../../service/authYoutubeApi');
const storage = require('../../service/storage');
const playlistCache = require('../../service/playlistCache');

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

	async checkPlaylistStatus() {
		this.playlistStatus = 'undetermined';
		let playlistIncludes = (await Promise.all((await storage.playlistList)
			.map(async playlistId => [playlistId, await authYoutubeApi.includes(playlistId, this.videoId)])))
			.filter(([_, itemIds]) => itemIds.length);
		let playlistIds = playlistIncludes.map(([playlistId]) => playlistId);
		this.playlistItemIds_ = playlistIncludes.flatMap(([_, itemIds]) => itemIds);

		this.$('#remove').title = playlistIds;
		this.playlistStatus = !!this.playlistItemIds_.length;
		this.$('#remove').title = await Promise.all(playlistIds.map(playlistId => playlistCache.getPlaylist(playlistId).title));
	}

	set videoId(value) {
		this.checkPlaylistStatus();
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
		this.emit('add');
	}

	async remove_(e) {
		e.stopPropagation(); // prevent emitSelect
		this.playlistStatus = 'undetermined';
		this.emit('remove', this.playlistItemIds_);
	}

	emitSelect_() {
		if (this.downloadStatus === 'true')
			this.emit('select');
	}
});
