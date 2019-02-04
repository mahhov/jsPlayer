const template = require('fs').readFileSync(`${__dirname}/listFrame.html`, 'utf8');
const XElement = require('../XElement');
const storage = require('../../service/Storage');

customElements.define('x-list-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
	}

	connectedCallback() {
		this.$('#search').addEventListener('input', () => this.filter_());
		this.$('#refresh').addEventListener('click', () => this.refresh_());
		this.refresh_();
	}

	filter_() {
		let filterString = this.$('#search').value;
		let filterRegex = new RegExp(filterString, 'i');
		[...this.$('#list').children].forEach(songLine =>
			songLine.hidden = filterString && !songLine.text.match(filterRegex));
	}

	refresh_() {
		storage.getSongList().then(songList => {
			this.$('#count').textContent = songList.length;
			XElement.clearChildren(this.$('#list'));
			songList.forEach((songName, i) => {
				let songLine = document.createElement('x-song-line');
				songLine.number = i + 1;
				songLine.title = songName;
				songLine.addEventListener('select', () => this.emitSelectSong_(i));
				songLine.addEventListener('remove', () => this.emitRemoveSong_(i));
				this.$('#list').appendChild(songLine);
			});
			this.filter_();
		});
	}

	emitSelectSong_(index) {
		this.dispatchEvent(new CustomEvent('select-song', {detail: index}));
	}

	emitRemoveSong_(index) {
		storage.getSongList().then(songList =>
			this.dispatchEvent(new CustomEvent('remove-song', {detail: songList[index]})));
	}

	selectSong(index) {
		[...this.$('#list').children].forEach((songLine, i) =>
			songLine.selected = i === index);
	}
});
// todo highlight selected song
