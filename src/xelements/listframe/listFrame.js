const template = require('fs').readFileSync(`${__dirname}/listFrame.html`, 'utf8');
const XElement = require('../XElement');
const storage = require('../../service/Storage');

customElements.define('x-list-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
	}

	connectedCallback() {
		this.$('#refresh').addEventListener('click', () => this.refresh_());
		this.$('#search').addEventListener('input', () => this.filter_());
		this.$('#limit').addEventListener('change', () => this.filter_());
		this.refresh_();
	}

	refresh_() {
		this.refreshPromise_ = storage.songList.then(async songList => {
			this.$('#count').textContent = songList.length;
			XElement.clearChildren(this.$('#list-container'));
			let list = document.createElement('div');

			for (let i in songList) {
				let songLine = document.createElement('x-song-line');
				songLine.number = parseInt(i) + 1;
				songLine.title = songList[i];
				songLine.addEventListener('select', () => this.emitSelectSong_(i));
				songLine.addEventListener('remove', () => this.emitRemoveSong_(i));
				list.appendChild(songLine);

				if (!(i % 1200))
					await new Promise(resolve => setTimeout(resolve, 0));
			}
			this.$('#list-container').appendChild(list);
			this.filter_();
			this.selectSong();
		});
	}

	async filter_() {
		// Ignoring case and symbols, each word of the filterString
		// must be included in the song line.
		// Both are broken on spaces and symbols.
		// Order of words does not matter.
		// Separators may be omitted if full words are entered.
		let inputString = this.$('#search').value;
		const charFilterRe = /[^a-zA-Z\d]/g;
		let inputWords = inputString.toLowerCase().split(charFilterRe);

		let songLines = await this.songLines_;
		let count = 0;
		for (let i in songLines) {
			let songLine = songLines[i];
			let songLineText = songLine.text.replace(charFilterRe, '').toLowerCase();
			songLine.hidden = !inputWords.every(word => songLineText.includes(word))
				|| this.$('#limit').checked && ++count > 100;

			if (!(i % 1200)) {
				await new Promise(resolve => setTimeout(resolve, 0));
				if (inputString !== this.$('#search').value)
					return;
			}
		}
	}

	async selectSong(index = this.selectedIndex_) {
		this.selectedIndex_ = index;
		(await this.songLines_).forEach((songLine, i) => songLine.selected = i === index);
	}

	emitSelectSong_(index) {
		this.dispatchEvent(new CustomEvent('select-song', {detail: index}));
	}

	async emitRemoveSong_(index) {
		let songList = await storage.songList;
		this.dispatchEvent(new CustomEvent('remove-song', {detail: songList[index]}));
	}

	get songLines_() {
		return this.refreshPromise_.then(() =>
			[...this.$('#list-container').firstElementChild.children]);
	}
});
