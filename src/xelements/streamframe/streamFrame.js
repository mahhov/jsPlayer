const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const Stream = require('bs-better-stream');
const storage = require('../../service/storage');
const playlistCache = require('../../service/playlistCache');
const Seeker = require('../../service/Seeker');
const Debouncer = require('../../service/Debouncer');
const authYoutubeApi = require('../../service/authYoutubeApi');

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
		this.nextSongIndexes = [];
		let songsStreamDebouncer = new Debouncer(2000);
		this.songsStream.each(() => songsStreamDebouncer.add(() => {
			this.$('#count').textContent = this.songsStream.length;
			this.seeker.setSize(this.songsStream.length);
			this.seeker.setShuffle(this.$('#player').shuffle);
			this.updateNextList();
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
		if (this.currentSong.audioData?.done)
			this.$('#player').audioData = await this.currentSong.audioData;
		else {
			this.currentSong.getWriteStream(await this.requestOptions);
			this.$('#player').videoSrc = this.currentSong;
		}
		this.updateNextList();
	}

	updateNextList() {
		if (!this.songsStream.length)
			return;

		// cancel downloading next songs
		let nextSongIndexes = this.seeker.peek(2, 5);
		this.nextSongIndexes
			.filter(songIndex => !nextSongIndexes.includes(songIndex))
			.forEach(songIndex => this.getSong(songIndex).stopDownload());
		this.nextSongIndexes = nextSongIndexes;

		// update next songs display
		let lines = this.$$('#next-list x-stream-frame-line');
		nextSongIndexes.forEach(async (songIndex, i) => {
			let song = this.getSong(songIndex);

			// get or create a line el
			let line = lines[i];
			if (!line) {
				line = document.createElement('x-stream-frame-line');
				line.addEventListener('select', () => this.setSong(line.songIndex, true));
				line.addEventListener('related', () =>
					this.emit('related-song', {id: this.getSong(line.songIndex).id, title: this.getSong(line.songIndex).title}));
				line.addEventListener('link', () => this.emit('link-song', this.getSong(line.songIndex).id));
				this.$('#next-list').append(line);
			}

			// update values of the line el
			line.songIndex = songIndex;
			line.title = song.title;
			line.selected = song === this.currentSong;
			let setLineStatus = status => {
				if (this.nextSongIndexes.indexOf(songIndex) === i)
					line.status = status;
			};

			// queue download nad update status
			if (song.audioData) {
				setLineStatus('reading');
				await song.audioData;
				setLineStatus('ready');
			} else {
				setLineStatus('undetermined');
				await Debouncer.sleep(6000);
				setLineStatus('downloading');
				if (this.nextSongIndexes.includes(songIndex))
					song.getWriteStream(await this.requestOptions).promise
						.then(async () => {
							setLineStatus('reading');
							song.audioData = song.audioData || this.$('#player').getAudioData(song.buffer.buffer);
							await song.audioData;
							song.audioData.done = true
							setLineStatus('ready');
						})
						.catch(() => setLineStatus('failed'));
			}
		});
	}

	get requestOptions() {
		return this.requestOptions_ = this.requestOptions_ ||
			authYoutubeApi.getHeaders().then(headers =>
				({filter: 'audioonly', requestOptions: {headers}}));
	}
});

// todo cache playlists to reduce youtube api queries
// todo refresh songs button
// todo playlist add/remove/refresh
// todo search songs
