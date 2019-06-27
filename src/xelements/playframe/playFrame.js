const template = require('fs').readFileSync(`${__dirname}/playFrame.html`, 'utf8');
const XElement = require('../XElement');
const storage = require('../../service/Storage');
const Seeker = require('../../service/Seeker');

customElements.define('x-play-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
	}

	connectedCallback() {
		this.$('#player').addEventListener('prev', () => this.prevSong_());
		this.$('#player').addEventListener('next', () => this.nextSong_());
		this.$('#player').addEventListener('shuffle', ({detail}) => this.setShuffle_(detail));
		this.$('#remove').addEventListener('click', () => this.emitRemove_());
		this.seeker = new Seeker();
		storage.getSongList().then(songList => this.seeker.setSize(songList.length));
	}

	prevSong_() {
		storage.getSongList().then(songList => this.setSong(this.seeker.getPrev()));
	}

	async nextSong_() {
		await storage.getSongList();
		this.setSong(this.seeker.getNext());
	}

	async setShuffle_(shuffle) {
		await storage.getSongList();
		this.seeker.setShuffle(shuffle);
	}

	emitRemove_() {
		this.dispatchEvent(new CustomEvent('remove-song', {detail: this.$('#player').src}));
	}

	setSong(index) {
		storage.getSongList().then(songList => {
			this.$('#player').src = songList[index];
			let numberText = `Playing ${index + 1} of ${songList.length}`;
			this.$('#status').textContent = `${numberText} ${songList[index]}`;
			this.dispatchEvent(new CustomEvent('playing-song', {detail: index}));
			new Notification(numberText, {body: songList[index]});
		});
	}
});
