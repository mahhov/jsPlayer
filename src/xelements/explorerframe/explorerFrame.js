const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const {shell} = require('electron');
const dwytpl = require('dwytpl');
const storage = require('../../service/storage');
const authYoutubeApi = require('../../service/authYoutubeApi');

customElements.define(name, class ExplorerFrame extends XElement {
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
		this.$('#count').addEventListener('keydown', e => e.key === 'Enter' && this.query_());
		this.$('#clear-button').addEventListener('click', () => this.clear_());
		this.$('#player').addEventListener('prev', () => this.prevSong_());
		this.$('#player').addEventListener('next', () => this.nextSong_());
		this.clear_();
		this.playlistPendingAdds_ = new dwytpl.VideoList();
		this.playlistPendingRemoves_ = new dwytpl.VideoList();
		[this.playlistPendingAdds_, this.playlistPendingRemoves_].forEach((videoList, i) =>
			videoList.videos.each(async (video, j) => {
				let line = document.createElement('x-playlist-pending-song-line');
				line.videoId = video.id;
				line.title = ExplorerFrame.getLineTitle_(video, j);
				line.adding = !i;
				this.$('#playlist-pending-list').appendChild(line);
			}));
		storage.playlistList.then(playlistList =>
			playlistList.forEach(playlist => {
				let option = document.createElement('option');
				option.textContent = playlist;
				this.$('#playlist').appendChild(option);
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
		if (this.$('#search').value && this.$('#count').checkValidity())
			this.search_.query(this.$('#search').value, this.$('#count').value);
	}

	clear_() {
		if (this.syncher_) {
			this.search_.videos.disconnect();
			this.syncher_.stopDownload();
			this.syncher_.tracker.summary.disconnect();
		}

		this.search_ = new dwytpl.Search();
		this.syncher_ = new dwytpl.Syncher(this.search_.videos, storage.explorerDownloadDir, [storage.downloadDir]);
		this.syncher_.download(10, {filter: 'audioonly'});

		this.syncher_.tracker.summary.each(summaryText => {
			this.$('#summary-line-one').textContent = summaryText[0];
			this.$('#summary-line-two').textContent = summaryText[1];
			this.updateCountDir_();
		});

		XElement.clearChildren(this.$('#list'));
		this.search_.videos.each((video, i) => {
			let line = document.createElement('x-downloading-song-line');
			line.videoId = video.id;
			line.title = ExplorerFrame.getLineTitle_(video, i);
			video.status.stream.each(statusText => line.status = statusText);
			video.status.promise
				.then(() => line.downloadStatus = 'true')
				.catch(() => line.downloadStatus = 'false');
			this.$('#list').appendChild(line);
			line.addEventListener('select', () => this.selectLine_(line, video));
			line.addEventListener('add', () => this.addLineToPlaylist_(line));
			line.addEventListener('remove', ({detail}) => this.removeLineFromPlaylist_(line, detail));
		});
	}

	selectLine_(line, video) {
		[...this.$('#list').children].forEach(lineI => {
			if (lineI.playStatus === 'true')
				lineI.playStatus = 'false';
		});
		line.playStatus = 'true';
		this.$('#player').src = video.fileName;
	}

	async addLineToPlaylist_(line) {
		this.playlistPendingAdds_.add(line.videoId);
		await authYoutubeApi.add(this.$('#playlist').value, line.videoId);
		line.playlistStatus = 'true';
	}

	async removeLineFromPlaylist_(line, playlistItemIds) {
		this.playlistPendingRemoves_.add(line.videoId);
		// todo bug with youtube api not allowing removing multiple instances of same video simultaneously
		await Promise.all(playlistItemIds.map(playlistItemId => authYoutubeApi.remove(playlistItemId)));
		line.playlistStatus = 'false';
	}

	async prevSong_() {
	}

	async nextSong_() {
	}

	static getLineTitle_(video, i) {
		return `${i.toString().padStart(2, 0)} ${video.title} ${video.id}`;
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
