const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const storage = require('../../service/storage');

customElements.define(name, class extends XElement {
	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		storage.playlists.then(playlists =>
			playlists.forEach(playlist => this.addPlaylistPanel_(playlist)));

		this.$('#add-playlist').addEventListener('click', () => this.onAddPlaylist_());
		this.$('#refresh-all').addEventListener('click', () => this.onRefreshAll_());
	}

	onAddPlaylist_() {
		this.addPlaylistPanel_(this.$('#playlist-id').value);
		this.savePlaylists();
	}

	addPlaylistPanel_(playlistId) {
		let playlistPanel = document.createElement('x-playlist-panel');
		playlistPanel.playlistId = playlistId;

		playlistPanel.addEventListener('removed', () => this.savePlaylists());

		this.$('#playlist-panels-list').appendChild(playlistPanel);
	}

	onRefreshAll_() {
		this.$$('#playlist-panels-list x-playlist-panel').forEach(playlistPanel =>
			playlistPanel.refresh());
	}

	savePlaylists() {
		storage.playlists = [...this.$('#playlist-panels-list').children].map(playlistPanel => playlistPanel.playlistId);
	}
});
