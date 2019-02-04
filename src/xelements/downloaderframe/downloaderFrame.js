const template = require('fs').readFileSync(`${__dirname}/downloaderFrame.html`, 'utf8');
const XElement = require('../XElement');
const styleSharing = require('shadow-dom-style-sharing');
const storage = require('../../service/Storage');

customElements.define('x-downloader-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
	}

	connectedCallback() {
		storage.getPlaylistList().then(playlistList =>
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
		styleSharing.process(playlistPanel);
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
		storage.savePlaylistList([...this.$('#playlist-panels-list').children].map(playlistPanel => playlistPanel.playlistId));
	}

	connectTracker(tracker) {
		if (this.connectedTracker_) {
			tracker.title.disconnect();
			tracker.summary.disconnect();
			tracker.progerss.disconnect();
			tracker.messages.disconnect();
		}
		this.connectedTracker_ = tracker;

		tracker.title.each(lines => this.$('#title').lines = lines);
		tracker.summary.each(lines => this.$('#summary').lines = lines);
		tracker.progerss.each(lines => this.$('#progress').lines = lines);
		tracker.messages.each(lines => this.$('#messages').lines = lines);
	}
});
