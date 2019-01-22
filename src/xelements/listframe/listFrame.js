const template = require('fs').readFileSync(`${__dirname}/listFrame.html`, 'utf8');
const XElement = require('../XElement');
const styleSharing = require('shadow-dom-style-sharing');
const songStorage = require('../../storage/SongStorage');

customElements.define('x-list-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
		this.$('#search').addEventListener('input', this.filter_.bind(this));
		this.$('#refresh').addEventListener('click', this.refresh_.bind(this));
		this.refresh_();
	}

	filter_() {
		let filterString = this.$('#search').value;
		let filterRegex = new RegExp(filterString, 'i');
		[...this.$('#list').children].forEach(song =>
			song.hidden = filterString && !song.textContent.match(filterRegex));
	}

	refresh_() {
		songStorage.getSongList().then(songList => {
			this.$('#count').textContent = songList.length;
			XElement.clearChildren(this.$('#list'));
			songList.forEach((songName, i) => {
				let songDiv = document.createElement('div');
				songDiv.textContent = `${i} ${songName}`;
				this.$('#list').appendChild(songDiv);
			});
			this.filter_();
		});
	}
});

// todo on clicking a song name, play that song
