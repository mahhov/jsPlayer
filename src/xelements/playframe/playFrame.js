const template = require('fs').readFileSync(`${__dirname}/playFrame.html`, 'utf8');
const XElement = require('../XElement');
const songStorage = require('../../service/SongStorage');
const Seeker = require('../../service/Seeker');

customElements.define('x-play-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
		this.songList = songStorage.getSongList();
		this.$('#player').addEventListener('prev', () => this.prevSong_());
		this.$('#player').addEventListener('next', () => this.nextSong_());
		this.$('#player').addEventListener('shuffle', ({detail}) => this.setShuffle_(detail));
		this.songList.then(songList => {
			/* todo seeker is defined async, and can cause errors if accessed before resolved */
			this.seeker = new Seeker(songList.length);
			this.setSong_(this.seeker.getCurrent());
		});
	}

	prevSong_() {
		this.setSong_(this.seeker.getPrev());
	}

	nextSong_() {
		this.setSong_(this.seeker.getNext());
	}

	setShuffle_(shuffle) {
		this.seeker.setShuffle(shuffle);
	}

	setSong_(index) {
		this.songList.then(songList => {
			this.$('#player').src = songList[index];
			this.$('#status').textContent = `playing ${index + 1} of ${songList.length} ${songList[index]}`;
		});
	}
});

// todo extract audio player and reuse in list frame
// todo extract seeker to service and add shuffle, etc
