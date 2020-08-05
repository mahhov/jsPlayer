const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const dwytpl = require('dwytpl');
const storage = require('../../service/storage');
const Searcher = require('../../service/Searcher');
const {shell} = require('electron');

customElements.define(name, class extends XElement {
	static get htmlTemplate() {
		return template;
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

			let searcher = new Searcher(this.$('#search').value, false);

			let songLineCount = 0;
			for (let i = 0; i < songList.length; i++) {
				let title = songList[i];
				let filter = !searcher.test(title)
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
					songLine.addEventListener('related', () => this.emitRelatedSong_(songLine.title));
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
		this.emit('select-song', index);
	}

	emitFavoriteSong_(name, favorite) {
		this.emit('favorite-song', {name, favorite});
	}

	emitRelatedSong_(name) {
		let id = dwytpl.Video.idFromFileName(name);
		let title = dwytpl.Video.titleFromFileName(name);
		this.emit('related-song', {id, title});
	}

	emitLinkSong_(name) {
		let id = dwytpl.Video.idFromFileName(name);
		this.emit('link-song', id);
	}

	emitRemoveSong_(name) {
		this.emit('remove-song', name);
	}
});

// todo refresh not working until entire app refreshed
