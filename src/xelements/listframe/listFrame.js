const template = require('fs').readFileSync(`${__dirname}/listFrame.html`, 'utf8');
const XElement = require('../XElement');
const styleSharing = require('shadow-dom-style-sharing');
const songStorage = require('../../storage/SongStorage');

customElements.define('x-list-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
		this.$('#refresh').addEventListener('click', () => this.refresh_());
		this.refresh_();
	}

	refresh_() {
		XElement.clearChildren(this.$('#list'));
		songStorage.getSongList().then(songList => songList.forEach(songName => {
			let songDiv = document.createElement('div');
			songDiv.textContent = songName;
			this.$('#list').appendChild(songDiv);
		}));
	}
});

// todo on clicking a song name, play that song
