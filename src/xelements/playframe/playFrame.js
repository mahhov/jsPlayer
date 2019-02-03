const template = require('fs').readFileSync(`${__dirname}/playFrame.html`, 'utf8');
const XElement = require('../XElement');
const storage = require('../../service/Storage');
const Seeker = require('../../service/Seeker');

customElements.define('x-play-frame', class DownloaderFrame extends XElement {
	constructor() {
		super(template);
	}

	connectedCallback() {
		this.songList = storage.getSongList();
		this.$('#player').addEventListener('prev', () => this.prevSong_());
		this.$('#player').addEventListener('next', () => this.nextSong_());
		this.$('#player').addEventListener('shuffle', ({detail}) => this.setShuffle_(detail));
		this.$('#remove').addEventListener('click', () => this.emitRemove_())
		/* todo rapidly clicking shuffle as the page is still loading causes wierd stuff to happen due to the async stuff here i assume */
		this.seeker = new Seeker();
		this.songList.then(songList => this.seeker.setSize(songList.length));
	}

	prevSong_() {
		this.songList.then(songList => this.setSong(this.seeker.getPrev()));
	}

	nextSong_() {
		this.songList.then(songList => this.setSong(this.seeker.getNext()));
	}

	setShuffle_(shuffle) {
		this.seeker.setShuffle(shuffle);
	}

	emitRemove_() {
		this.dispatchEvent(new CustomEvent('remove-song', {detail: this.playingIndex_}));
	}

	setSong(index) {
		this.playingIndex_ = index;
		this.songList.then(songList => {
			this.$('#player').src = songList[index];
			let numberText = `Playing ${index + 1} of ${songList.length}`;
			this.$('#status').textContent = `${numberText} ${songList[index]}`;
			new Notification(numberText, {body: songList[index]});
		});
	}
});
