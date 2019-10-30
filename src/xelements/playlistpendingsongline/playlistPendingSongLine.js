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
		this.$('#container').addEventListener('click', () => this.checkPlaylistStatus()); // todo recheck playlist status on an interval
	}

	// todo share code with downloading song line
	async checkPlaylistStatus() {
		this.checking = true;
		let playlistItemIdsPromises = (await storage.playlistList).map(playlistId =>
			authYoutubeApi.includes(playlistId, this.videoId));
		this.playlistItemIds_ = (await Promise.all(playlistItemIdsPromises)).flat();
		if (this.adding === !!this.playlistItemIds_.length)
			this.remove();
		this.checking = false;
	}

	set videoId(value) {
		this.playlistStatus = 'undetermined';
		this.checkPlaylistStatus();
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
