const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const authYoutubeApi = require('../../service/authYoutubeApi');
const storage = require('../../service/storage');

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {
			videoId: false,
			title: false,
			adding: true,
			checking: true
		};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		this.intervalCheck_ = setInterval(() => this.checkPlaylistStatus_(), 12000);
	}

	// todo share code with downloading song line
	async checkPlaylistStatus_() {
		if (!this.videoId)
			return;
		this.checking = true;
		let playlistItemIdsPromises = (await storage.playlists).map(playlistId =>
			authYoutubeApi.includes(playlistId, this.videoId));
		this.playlistItemIds_ = (await Promise.all(playlistItemIdsPromises)).flat();
		if (this.adding === !!this.playlistItemIds_.length) {
			clearInterval(this.intervalCheck_);
			this.remove();
		}
		this.checking = false;
	}

	set title(value) {
		this.$(`#title`).textContent = value;
	}

	set adding(value) {
		this.$('#container').classList.toggle('adding', value);
	}

	set checking(value) {
		this.$('#container').classList.toggle('checking', value);
	}
});
