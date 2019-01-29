const template = require('fs').readFileSync(`${__dirname}/playFrame.html`, 'utf8');
const XElement = require('../XElement');
const storage = require('../../service/Storage');
const Seeker = require('../../service/Seeker');

customElements.define('x-play-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
	}

	connectedCallback() {
		this.songList = storage.getSongList();
		this.$('#player').addEventListener('prev', () => this.prevSong_());
		this.$('#player').addEventListener('next', () => this.nextSong_());
		this.$('#player').addEventListener('shuffle', ({detail}) => this.setShuffle_(detail));
		/* todo rapidly clicking shuffle as the page is still loading causes wierd stuff to happen due to the async stuff here i assume */
		this.seeker = new Seeker();
		this.songList.then(songList => this.seeker.setSize(songList.length))
	}

	prevSong_() {
		this.songList.then(songList => this.setSong_(this.seeker.getPrev()));
	}

	nextSong_() {
		this.songList.then(songList => this.setSong_(this.seeker.getNext()));
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
