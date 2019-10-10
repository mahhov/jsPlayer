const template = require('fs').readFileSync(`${__dirname}/listFrame.html`, 'utf8');
const XElement = require('../XElement');
const storage = require('../../service/storage');
const {shell} = require('electron');

customElements.define('x-list-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
	}

	connectedCallback() {
		this.$('#refresh').addEventListener('click', () => this.refresh_());
		this.$('#link').addEventListener('click', () => this.link_());
		this.$('#search').addEventListener('input', () => this.refresh_());
		this.$('#favorite').addEventListener('change', () => this.refresh_());
		this.$('#limit').addEventListener('change', () => this.refresh_());
		// no need to refresh_(), as selectSong will be called
	}

	async refresh_() {
		await this.refreshPromise_;
		this.refreshPromise_ = storage.songList.then(async songList => {
			let songLines = [...this.$('#list-container').children];
			this.$('#count').textContent = songList.length;

			// Ignoring case and symbols, each word of the filterString
			// must be included in the song line.
			// Both are broken on spaces and symbols.
			// Order of words does not matter.
			// Separators may be omitted if full words are entered.
			let inputString = this.$('#search').value;
			const charFilterRe = /[^a-zA-Z\d]/g;
			let inputWords = inputString.toLowerCase().split(charFilterRe);

			let songLineCount = 0;
			for (let i = 0; i < songList.length; i++) {
				let title = songList[i];

				let songLineText = title.replace(charFilterRe, '').toLowerCase();

				let filter = !inputWords.every(word => songLineText.includes(word))
					|| this.$('#favorite').checked && !await storage.isSongFavorite(title)
					|| this.$('#limit').checked && songLineCount > 99;
				if (filter)
					continue;

				let songLine;
				if (songLineCount < songLines.length) {
					songLine = songLines[songLineCount];
					songLine.classList.remove('hidden');
				} else {
					songLine = document.createElement('x-song-line');
					songLine.addEventListener('select', () => this.emitSelectSong_(songLine.number - 1));
					songLine.addEventListener('favorite', () => this.emitFavoriteSong_(songLine.title, songLine.favorited));
					songLine.addEventListener('link', () => this.emitLinkSong_(songLine.title));
					songLine.addEventListener('remove', () => this.emitRemoveSong_(songLine.title));
					this.$('#list-container').appendChild(songLine);
				}
				songLineCount++;

				songLine.number = i + 1;
				songLine.title = title;
				songLine.favorited = await storage.isSongFavorite(title);
				songLine.selected = i === this.selectedIndex_;
			}

			for (; songLineCount < songLines.length; songLineCount++)
				songLines[songLineCount].classList.add('hidden');
		});
	}

	link_() {
		shell.openExternal(storage.downloadDir);
	}

	updateFavoriteStatus() {
		this.refresh_();
	}

	selectSong(index = this.selectedIndex_) {
		this.selectedIndex_ = index;
		this.refresh_();
	}

	emitSelectSong_(index) {
		this.dispatchEvent(new CustomEvent('select-song', {detail: index}));
	}

	emitFavoriteSong_(name, favorite) {
		this.dispatchEvent(new CustomEvent('favorite-song', {detail: {name, favorite}}));
	}

	emitLinkSong_(name) {
		this.dispatchEvent(new CustomEvent('link-song', {detail: name}));
	}

	emitRemoveSong_(name) {
		this.dispatchEvent(new CustomEvent('remove-song', {detail: name}));
	}
});

// todo refresh not working until entire app refreshed
