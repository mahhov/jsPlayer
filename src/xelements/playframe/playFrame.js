const template = require('fs').readFileSync(`${__dirname}/playFrame.html`, 'utf8');
const XElement = require('../XElement');
const songStorage = require('../../service/SongStorage');
const Seeker = require('../../service/Seeker');

customElements.define('x-play-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
		this.songList = songStorage.getSongList();
		this.songList.then(songList => this.seeker = new Seeker(songList.length));
		this.$('#player').addEventListener('end', () => this.nextSong());
		this.nextSong();
	}

	nextSong() {
		this.songList.then(songList => {
			let index = this.seeker.getNext();
			this.$('#player').src = songList[index];
		});
	}
});

// extract audio player and reuse in list frame
// extract seeker to service and add shuffle, etc
