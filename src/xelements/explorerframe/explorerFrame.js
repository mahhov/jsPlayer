const template = require('fs').readFileSync(`${__dirname}/explorerFrame.html`, 'utf8');
const XElement = require('../XElement');
const dwytpl = require('dwytpl');
const storage = require('../../service/Storage');

customElements.define('x-explorer-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
	}

	connectedCallback() {
		this.$('#search-button').addEventListener('click', () => this.query_());
		this.$('#clear-button').addEventListener('click', () => this.clear_());

		this.$('#player').addEventListener('prev', () => this.prevSong_());
		this.$('#player').addEventListener('next', () => this.nextSong_());

		this.clear_();
	}

	query_() {
		this.search_.query(this.$('#search').value);
	}

	clear_() {
		if (this.syncher_) {
			this.syncher_.stopDownload();
			this.syncher_.tracker.summary.disconnect();
		}

		this.search_ = new dwytpl.Search(this.playlistId);
		this.syncher_ = new dwytpl.Syncher(this.search_);
		this.syncher_.setDownloadDir(storage.explorerDownloadDir);
		this.syncher_.download();

		this.syncher_.tracker.summary.each(summaryText => {
			this.$('#summary-line-one').textContent = summaryText[0];
			this.$('#summary-line-two').textContent = summaryText[1];
		});

		XElement.clearChildren(this.$('#list'));
		this.search_.getVideos().each(video => {
			let name = document.createElement('div');
			name.textContent = video.getName_();
			let status = document.createElement('div');
			video.status.stream.each(statusText => status.textContent = statusText);
			let container = document.createElement('div');
			container.appendChild(name);
			container.appendChild(status);
			container.classList.add('line');
			container.addEventListener('click', () =>
				this.setSong_(video.getFileName_()));
			this.$('#list').appendChild(container);
		});
	}

	async prevSong_() {
	}

	async nextSong_() {
	}

	async setSong_(name) {
		console.log('play', name);
		this.$('#player').src = name;
	}
});

// todo
// styling
// keyboard shortcuts
// click to play
// auto play
// add
// remove
// indicate which already added
// add
