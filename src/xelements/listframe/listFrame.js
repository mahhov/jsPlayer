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
		// Ignoring case and symbols, each word of the filterString
		// must be included in the song line.
		// Both are broken on spaces and symbols.
		// Order of words does not matter.
		// Separators may be omitted if full words are entered.
		const charFilterRe = /[^a-zA-Z\d]/g;
		let inputWords = this.$('#search').value.toLowerCase().split(charFilterRe);
		this.songLines_.forEach(songLine => {
			let songLineText = songLine.text.replace(charFilterRe, '').toLowerCase();
			songLine.hidden = !inputWords.every(word => songLineText.includes(word));
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
