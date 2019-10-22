const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const storage = require('../../service/storage');
const Seeker = require('../../service/Seeker');

customElements.define(name, class extends XElement {
	static get attributeTypes() {
		return {playerFocus: true};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		this.$('#player').addEventListener('prev', () => this.prevSong_());
		this.$('#player').addEventListener('next', () => this.nextSong_());
		this.$('#player').addEventListener('shuffle', ({detail}) => this.setShuffle_(detail));
		this.$('#favorite').addEventListener('change', () => this.emitFavorite_());
		this.$('#link').addEventListener('click', () => this.emitLink_());
		this.seeker = new Seeker();
		storage.songList.then(songList => this.seeker.setSize(songList.length));
	}

	set playerFocus(value) {
		this.$('#player').focus = value;
	}

	stopPlay() {
		this.$('#player').stopPlay();
	}

	async prevSong_() {
		await storage.songList;
		this.setSong(this.seeker.getPrev())
	}

	async nextSong_() {
		await storage.songList;
		this.setSong(this.seeker.getNext());
	}

	async setShuffle_(shuffle) {
		await storage.songList;
		this.seeker.setShuffle(shuffle);
	}

	async updateFavoriteStatus() {
		this.$('#favorite').checked = await storage.isSongFavorite(this.$('#player').src);
	}

	emitFavorite_() {
		this.emit('favorite-song', {name: this.$('#player').src, favorite: this.$('#favorite').checked});
	}

	emitLink_() {
		this.emit('link-song', this.$('#player').src);
	}

	async setSong(index, skipTo) {
		if (skipTo)
			this.seeker.skipTo(index);
		let songList = await storage.songList;
		let name = songList[index];
		this.$('#player').src = name;
		this.updateFavoriteStatus();
		let numberText = `Playing ${index + 1} of ${songList.length}`;
		this.$('#status').textContent = `${numberText} ${name}`;
		this.emit('playing-song', index);
		new Notification(numberText, {body: name});
	}
});
