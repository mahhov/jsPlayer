const template = require('fs').readFileSync(`${__dirname}/explorerFrame.html`, 'utf8');
const XElement = require('../XElement2');
const dwytpl = require('dwytpl');
const storage = require('../../service/Storage');

customElements.define('x-explorer-frame', class DownloaderFrame extends XElement {
	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		this.$('#search-button').addEventListener('click', () => this.query_());

		this.$('#player').addEventListener('prev', () => this.prevSong_());
		this.$('#player').addEventListener('next', () => this.nextSong_());

		this.clear_();
	}

	query_() {
		this.clear_();
		this.search_.query(this.$('#search').value);
	}

	clear_() {
		if (this.syncher_) {
			this.search_.videos.disconnect();
			this.syncher_.stopDownload();
			this.syncher_.tracker.summary.disconnect();
		}

		this.search_ = new dwytpl.Search(this.playlistId);
		this.syncher_ = new dwytpl.Syncher(this.search_);
		this.syncher_.setDownloadDir(storage.explorerDownloadDir, [storage.downloadDir]);
		this.syncher_.download();

		this.syncher_.tracker.summary.each(summaryText => {
			this.$('#summary-line-one').textContent = summaryText[0];
			this.$('#summary-line-two').textContent = summaryText[1];
		});

		XElement.clearChildren(this.$('#list'));
		this.search_.videos.each(async video => {
			let line = document.createElement('x-downloading-song-line');
			line.videoId = video.id_;
			line.title = video.getName_();
			video.status.stream.each(statusText => line.status = statusText);
			video.status.promise
				.then(() => line.downloadStatus = 'true')
				.catch(() => line.downloadStatus = 'false');
			this.$('#list').appendChild(line);
			line.addEventListener('select', () => this.selectLine_(line, video));
		});
	}

	selectLine_(line, video) {
		[...this.$('#list').children].forEach(lineI => {
			if (lineI.playStatus === 'true')
				lineI.playStatus = 'false';
		});
		line.playStatus = 'true';
		this.setSong_(video.getFileName_())
	}

	async prevSong_() {
	}

	async nextSong_() {
	}

	async setSong_(name) {
		this.$('#player').src = name;
	}
});

// todo
// styling
// keyboard shortcuts
// auto play
// confirm add/remove
// explorer 401 on no search results
// ability to remove from playlist from list frame
// dim add/remove buttons too
// download fail
// explorer frame to display selected backgr ound for currently playing on refresh
// button to clear explorer download dir
