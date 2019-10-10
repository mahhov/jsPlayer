const template = require('fs').readFileSync(`${__dirname}/explorerFrame.html`, 'utf8');
const XElement = require('xx-element');
const dwytpl = require('dwytpl');
const storage = require('../../service/Storage');

customElements.define('x-explorer-frame', class DownloaderFrame extends XElement {
	static get attributeTypes() {
		return {playerFocus: true};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		this.$('#search').addEventListener('change', () => this.query_());
		this.$('#search-button').addEventListener('click', () => this.query_());
		this.$('#clear-button').addEventListener('click', () => this.clear_());
		this.$('#player').addEventListener('prev', () => this.prevSong_());
		this.$('#player').addEventListener('next', () => this.nextSong_());
		this.clear_();
	}

	set playerFocus(value) {
		this.$('#player').focus = value;
	}

	stopPlay() {
		this.$('#player').stopPlay();
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

		this.search_ = new dwytpl.Search();
		this.syncher_ = new dwytpl.Syncher(this.search_, storage.explorerDownloadDir, [storage.downloadDir]);
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
		this.$('#player').src = video.getFileName_();
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
