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
		// Ignoring case, each character of filterString must be present in the song line,
		// either adjacent to the previous matched character, or at the start of a new word;
		// except the first filter character, which can be matched mid-word.
		let filterString = [...this.$('#search').value]
			.map(char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape special regex characters
			.join('(.*\\.)?');
		let filterRegex = new RegExp(filterString, 'i');

		this.songLines_.forEach(songLine => {
			let words = songLine.text.match(/[a-zA-Z]+|\d+|./g) || [];
			let line = words.join('.');
			songLine.hidden = filterString && !line.match(filterRegex);
		});
	}

	refresh_() {
		storage.getSongList().then(songList => {
			this.$('#count').textContent = songList.length;
			XElement.clearChildren(this.$('#list-container'));
			let list = document.createElement('div');
			songList.forEach((songName, i) => {
				let songLine = document.createElement('x-song-line');
				songLine.number = i + 1;
				songLine.title = songName;
				songLine.addEventListener('select', () => this.emitSelectSong_(i));
				songLine.addEventListener('remove', () => this.emitRemoveSong_(i));
				list.appendChild(songLine);
			});
			this.$('#list-container').appendChild(list);
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
		this.songLines_.forEach((songLine, i) => songLine.selected = i === index);
	}

	get songLines_() {
		return [...this.$('#list-container').firstElementChild.children];
	}
});
