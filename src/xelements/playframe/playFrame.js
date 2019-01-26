const template = require('fs').readFileSync(`${__dirname}/playFrame.html`, 'utf8');
const XElement = require('../XElement');
const songStorage = require('../../storage/SongStorage');

customElements.define('x-play-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
		this.songList = songStorage.getSongList();
		this.$('#player').addEventListener('end', () => this.nextSong());
		this.nextSong();
	}

	nextSong() {
		this.songList.then(songList => this.$('#player').src = songList[0]);
	}
});

// extract audio player and reuse in list frame
// extract seeker to service and add shuffle, etc
