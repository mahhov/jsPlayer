const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const Stream = require('bs-better-stream');
const storage = require('../../service/storage');
const playlistCache = require('../../service/playlistCache');
const Seeker = require('../../service/Seeker');
const Debouncer = require('../../service/Debouncer');
const authYoutubeApi = require('../../service/authYoutubeApi');
const Searcher = require('../../service/Searcher');

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {playerFocus: true};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		this.songsStream = new Stream()
			.writePromise(storage.playlists)
			.flatten()
			.map(playlistId => playlistCache.getPlaylist(playlistId))
			.map(playlist => playlist.videos)
			.joinCollapse();

		this.$('#player').addEventListener('prev', () => this.setSong(this.seeker.getPrev()));
		this.$('#player').addEventListener('next', () => this.setSong(this.seeker.getNext()));
		this.$('#player').addEventListener('shuffle', ({detail}) => {
			this.seeker.setShuffle(detail);
			this.updateList();
		});

		this.$('#search-input').addEventListener('input', () => this.updateList());

		this.seeker = new Seeker();
		this.nextSongIndexes = [];
		let songsStreamDebouncer = new Debouncer(2000);
		this.songsStream.each(() => songsStreamDebouncer.add(() => {
			this.$('#count').textContent = this.songsStream.length;
			this.seeker.setSize(this.songsStream.length);
			this.seeker.setShuffle(this.$('#player').shuffle);
			this.updateList();
		}));
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

	async setSong(index, skipTo = false) {
		let song = this.getSong(index);
		if (!song || song === this.currentSong)
			return;
		this.currentSong = song;
		if (skipTo)
			this.seeker.skipTo(index);
		if (song.audioData?.done)
			this.$('#player').audioData = await song.audioData;
		else {
			await authYoutubeApi.download(song);
			this.$('#player').videoSrc = song;
		}
		this.updateList();
	}

	updateList() {
		if (this.$('#search-input').value)
			this.updateSearchList();
		else
			this.updateNextList();
	}

	updateNextList() {
		if (!this.songsStream.length)
			return;

		// cancel downloading next songs
		let nextSongIndexes = this.seeker.peek(2, 5);
		this.nextSongIndexes
			.filter(songIndex => !nextSongIndexes.includes(songIndex))
			.forEach(songIndex => {
				this.getSong(songIndex).stopDownload();
				this.getSong(songIndex).audioData = null;
			});
		this.nextSongIndexes = nextSongIndexes;

		// update next songs display
		this.showLines(nextSongIndexes.length);
		nextSongIndexes.forEach((songIndex, i) => {
			let song = this.getSong(songIndex);
			this.setLine(i, songIndex, song, 6000);
		});
	}

	updateSearchList() {
		let searcher = new Searcher(this.$('#search-input').value, false);
		let results = this.songsStream
			.map((song, i) => [song, i])
			.filter(([song]) => searcher.test(`${song.title} ${song.id}`))
			.filterCount(99)
			.each(([song, songIndex], i) => this.setLine(i, songIndex, song, -1));
		this.showLines(results.length);
	}

	get lines() {
		return [...this.$$('#list x-stream-frame-line')];
	}

	showLines(count) {
		this.lines.forEach((line, i) => line.classList.toggle('hidden', i >= count));
	}

	async setLine(i, songIndex, song, downloadDelay) {
		// get or create a line el
		let line = this.lines[i];
		if (!line) {
			line = document.createElement('x-stream-frame-line');
			line.addEventListener('select', () => this.setSong(line.songIndex, true));
			line.addEventListener('related', () =>
				this.emit('related-song', {id: this.getSong(line.songIndex).id, title: this.getSong(line.songIndex).title}));
			line.addEventListener('link', () => this.emit('link-song', this.getSong(line.songIndex).id));
			this.$('#list').append(line);
		}

		// update values of the line el
		line.songIndex = songIndex;
		line.title = song.title;
		line.selected = song === this.currentSong;
		let setLineStatus = status => {
			let line = this.lines.find(line => line.songIndex === songIndex);
			if (line)
				line.status = status;
		};

		// queue download and update status
		if (downloadDelay < 0)
			setLineStatus('ready');
		else if (song.audioData) {
			setLineStatus('reading');
			await song.audioData;
			setLineStatus('ready');
		} else {
			setLineStatus('undetermined');
			await Debouncer.sleep(downloadDelay);
			setLineStatus('downloading');
			if (this.nextSongIndexes.includes(songIndex))
				authYoutubeApi.download(song)
					.then(async () => {
						setLineStatus('reading');
						song.audioData = song.audioData || this.$('#player').getAudioData(song.buffer.buffer);
						await song.audioData;
						song.audioData.done = true
						setLineStatus('ready');
					})
					.catch(() => setLineStatus('failed'));
		}
	}
});

// todo cache playlists to reduce youtube api queries
// todo refresh songs button
// todo playlist add/remove/refresh
// todo search songs
