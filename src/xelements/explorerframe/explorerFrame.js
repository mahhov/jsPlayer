const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const dwytpl = require('dwytpl');
const storage = require('../../service/storage');
const {shell} = require('electron');

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {playerFocus: true};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		this.$('#link-dir').addEventListener('click', () => this.linkDir_());
		this.$('#clear-dir').addEventListener('click', () => this.clearDir_());
		this.$('#search').addEventListener('keydown', e => e.key === 'Enter' && this.query_());
		this.$('#search-button').addEventListener('click', () => this.query_());
		this.$('#clear-button').addEventListener('click', () => this.clear_());
		this.$('#player').addEventListener('prev', () => this.prevSong_());
		this.$('#player').addEventListener('next', () => this.nextSong_());
		this.clear_();
		this.$('#playlist-pending-refresh').addEventListener('click', () =>
			[...this.$('#playlist-pending-list').children].forEach(line => line.checkPlaylistStatus()));
		this.playlistPendingAdds_ = new dwytpl.VideoList();
		this.playlistPendingRemoves_ = new dwytpl.VideoList();
		[this.playlistPendingAdds_, this.playlistPendingRemoves_].forEach((videoList, i) =>
			videoList.videos.each(async video => {
				let line = document.createElement('x-playlist-pending-song-line');
				line.videoId = video.id_;
				line.title = video.getName_();
				line.adding = !i;
				this.$('#playlist-pending-list').appendChild(line);
			}));
	}

	set playerFocus(value) {
		this.$('#player').focus = value;
	}

	stopPlay() {
		this.$('#player').stopPlay();
	}

	async updateCountDir_() {
		this.$('#count-dir').textContent = await storage.explorerDirCount;
	}

	linkDir_() {
		shell.openExternal(storage.explorerDownloadDir);
	}

	async clearDir_() {
		await storage.clearExplorerDownloadDir();
		this.updateCountDir_();
	}

	query_() {
		this.clear_();
		if (this.$('#search').value)
			this.search_.query(this.$('#search').value);
	}

	clear_() {
		if (this.syncher_) {
			this.search_.videos.disconnect();
			this.syncher_.stopDownload();
			this.syncher_.tracker.summary.disconnect();
		}

		this.search_ = new dwytpl.Search();
		this.syncher_ = new dwytpl.Syncher(this.search_, storage.explorerDownloadDir, [storage.downloadDir]);
		this.syncher_.download();

		this.syncher_.tracker.summary.each(summaryText => {
			this.$('#summary-line-one').textContent = summaryText[0];
			this.$('#summary-line-two').textContent = summaryText[1];
			this.updateCountDir_();
		});

		XElement.clearChildren(this.$('#list'));
		this.search_.videos.each(video => {
			let line = document.createElement('x-downloading-song-line');
			line.videoId = video.id_;
			line.title = video.getName_();
			video.status.stream.each(statusText => line.status = statusText);
			video.status.promise
				.then(() => line.downloadStatus = 'true')
				.catch(() => line.downloadStatus = 'false');
			this.$('#list').appendChild(line);
			line.addEventListener('select', () => this.selectLine_(line, video));
			line.addEventListener('playlist-status-changed', ({detail}) => this.addPlaylistPending_(video.id_, detail));
		});
	}

	selectLine_(line, video) {
		[...this.$('#list').children].forEach(lineI => {
			if (lineI.playStatus === 'true')
				lineI.playStatus = 'false';
		});
		line.playStatus = 'true';
		this.$('#player').src = video.getFileName_();
	}

	addPlaylistPending_(videoId, adding) {
		(adding ? this.playlistPendingAdds_ : this.playlistPendingRemoves_).add(videoId);
	}

	async prevSong_() {
	}

	async nextSong_() {
	}
});

// todo
// styling
// confirm add/remove
// download fail
// explorer frame to display selected background for currently playing on refresh
// button to clear explorer download dir
// freeze on search
// remove remove button from play frame
// downloading songs added from explorer frame not happening
// remove from playlists when removing from list frame
// removing from explorer frame should also remove from playlist frame and downloads
// display temp dir count and add a clear button
// copyable text without underscores
// error playing songs in non-temp dir
// delay in adding/removing to playlist to show
// error sometimes on load regarding file not found
