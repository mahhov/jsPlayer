const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const Stream = require('bs-better-stream');
const storage = require('../../service/storage');
const playlistCache = require('../../service/playlistCache');
const Seeker = require('../../service/Seeker');

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {playerFocus: true};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		this.songsStream = new Stream()
			.writePromise(storage.playlistList)
			.flatten()
			.map(playlistId => playlistCache.getPlaylist(playlistId))
			.map(playlist => playlist.videos)
			.joinCollapse();

		this.$('#player').addEventListener('prev', () => this.setSong(this.seeker.getPrev()));
		this.$('#player').addEventListener('next', () => this.setSong(this.seeker.getNext()));
		this.$('#player').addEventListener('shuffle', ({detail}) => {
			this.seeker.setShuffle(detail);
			this.updateNextList();
		});
		this.seeker = new Seeker();
		this.songsStream.each(() => {
			this.$('#count').textContent = this.songsStream.length;
			this.seeker.setSize(this.songsStream.length);
			this.seeker.setShuffle(this.$('#player').shuffle);
			this.updateNextList();
		});
	}

	set playerFocus(value) {
		this.$('#player').focus = value;
	}

	getSong(index) {
		return this.songsStream.outValues[index];
	}

	stopPlay() {
		this.$('#player').stopPlay();
	}

	setSong(index, skipTo = false) {
		this.currentSong_ = this.getSong(index);
		if (!this.currentSong_)
			return;
		if (skipTo)
			this.seeker.skipTo(index);
		this.currentSong_.getWriteStream();
		this.$('#player').videoSrc = this.currentSong_;
		this.updateNextList();
	}

	updateNextList() {
		if (!this.songsStream.length)
			return;

		let lines = this.$$('#next-list x-stream-frame-line');
		this.seeker.peek(2, 5).forEach((songIndex, i) => {
			let song = this.getSong(songIndex);
			song.getWriteStream();

			let line = lines[i];
			if (!line) {
				line = document.createElement('x-stream-frame-line');
				line.addEventListener('select', () => this.setSong(line.songIndex, true));
				line.addEventListener('related', () =>
					this.emit('related-song', {id: this.getSong(line.songIndex).id, title: this.getSong(line.songIndex).title}));
				line.addEventListener('link', () => this.emit('link-song', this.getSong(line.songIndex).id));
				this.$('#next-list').append(line);
			}

			line.songIndex = songIndex;
			line.title = song.title;
			line.selected = song === this.currentSong_;
			song.status.stream.each(statusText => line.status = statusText);
			line.downloadStatus = 'undetermined';
			song.getWriteStream().promise
				.then(() => line.downloadStatus = 'true')
				.catch(() => line.downloadStatus = 'false');
		});
	}
});

// todo cache playlists to reduce youtube api queries
