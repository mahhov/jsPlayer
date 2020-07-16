const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const storage = require('../../service/storage');

customElements.define(name, class extends XElement {
	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		storage.playlistList.then(playlistList =>
			playlistList.forEach(playlist => this.addPlaylistPanel_(playlist)));

		this.$('#add-playlist').addEventListener('click', () => this.onAddPlaylist_());
		this.$('#refresh-all').addEventListener('click', () => this.onRefreshAll_());
	}

	onAddPlaylist_() {
		this.addPlaylistPanel_(this.$('#playlist-id').value);
		this.savePlaylistList_();
	}

	addPlaylistPanel_(playlistId) {
		let playlistPanel = document.createElement('x-playlist-panel');
		playlistPanel.playlistId = playlistId;

		playlistPanel.addEventListener('download', ({detail: tracker}) => {
			this.connectTracker(tracker);
			this.$$('#playlist-panels-list x-playlist-panel').forEach(playlistPanelIter => {
				if (playlistPanelIter !== playlistPanel)
					playlistPanelIter.stopDownload();
			});
		});
		playlistPanel.addEventListener('removed', () => this.savePlaylistList_());

		this.$('#playlist-panels-list').appendChild(playlistPanel);
	}

	onRefreshAll_() {
		this.$$('#playlist-panels-list x-playlist-panel').forEach(playlistPanel =>
			playlistPanel.refresh());
	}

	savePlaylistList_() {
		storage.playlistList = [...this.$('#playlist-panels-list').children].map(playlistPanel => playlistPanel.playlistId);
	}

	connectTracker(tracker) {
		if (this.connectedTracker_) {
			tracker.title.disconnect();
			tracker.summary.disconnect();
			tracker.progress.disconnect();
			tracker.messages.disconnect();
		}
		this.connectedTracker_ = tracker;

		tracker.title.each(lines => this.$('#title').lines = lines);
		tracker.summary.each(lines => this.$('#summary').lines = lines.splice(0, 2));
		tracker.progress.each(lines => this.$('#progress').lines = lines);
		tracker.messages.each(lines => this.$('#messages').lines = lines);
	}
});
