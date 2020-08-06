const {importUtil, XElement} = require('xx-element');
const {template, name} = importUtil(__filename);
const Debouncer = require('../../service/Debouncer');
const storage = require('../../service/storage');
const AudioTrack = require('../../service/AudioTrack');
const shortcuts = require('../../service/shortcuts');

const SEEK_DELTA_S = 10;

customElements.define(name, class Player extends XElement {
	static get attributeTypes() {
		return {src: false, shuffle: true, focus: true};
	}

	static get htmlTemplate() {
		return template;
	}

	connectedCallback() {
		storage.shufflePreference.then(shuffle => {
			this.onShuffleSet_(shuffle);
			this.onEnd_();
		});

		this.audioTrack_ = new AudioTrack();
		this.audioTrack_.setTimeListener(() => this.onTimeChange_());
		this.audioTrack_.setEndListener(() => this.onEnd_());
		this.$('#time-bar').addEventListener('progress-set', ({detail}) => this.onSetTime_(detail));
		this.$('#prev').addEventListener('click', () => this.onPrev_());
		this.$('#pause').addEventListener('change', ({detail}) => this.onPauseSet_(!detail));
		this.$('#next').addEventListener('click', () => this.onEnd_());
		this.$('#shuffle').addEventListener('change', ({detail}) => this.onShuffleSet_(detail));

		this.$('#visualizer').analyzer = this.audioTrack_.analyzer;

		shortcuts.addListenerKeydown(this.handleKeypress_.bind(this));
		let prevDebouncer = new Debouncer(1000, true);
		let nextDebouncer = new Debouncer(1000, true);
		shortcuts.addGlobalShortcutListener(shortcuts.globalShortcutEvents.PREV, () => prevDebouncer.add(() => this.focus_ && this.onPrev_()));
		shortcuts.addGlobalShortcutListener(shortcuts.globalShortcutEvents.NEXT, () => nextDebouncer.add(() => this.focus_ && this.onEnd_()));
		shortcuts.addGlobalShortcutListener(shortcuts.globalShortcutEvents.PAUSE, () => this.focus_ && this.pauseToggle_());
		shortcuts.addGlobalShortcutListener(shortcuts.globalShortcutEvents.BACKWARD, () => this.focus_ && this.seekBackward_());
		shortcuts.addGlobalShortcutListener(shortcuts.globalShortcutEvents.FORWARD, () => this.focus_ && this.seekForward_());

		this.videoSrcDebouncer_ = new Debouncer(500);
	}

	set src(value) {
		this.clearVideoSrc();
		this.onPauseSet_(true);
		storage.readSong(value)
			.then(({buffer}) => this.audioTrack_.readAudioData(buffer))
			.then(audioData => {
				if (value !== this.src)
					return;
				this.audioTrack_.audioData = audioData;
				this.onSetTime_(0);
				this.onPauseSet_(false);
			});
	}

	set videoSrc(video) {
		this.clearVideoSrc();
		this.videoSrc_ = video;
		this.onPauseSet_(true);

		let first = true;
		let updateAudioTrack = () => this.videoSrcDebouncer_.add(async () => {
			this.audioTrack_.audioData = await this.audioTrack_.readAudioData(video.buffer.buffer);
			if (first) {
				this.onSetTime_(0);
				this.onPauseSet_(false);
				first = false;
			} else if (!this.audioTrack_.paused) {
				this.audioTrack_.pause();
				this.audioTrack_.play();
			}
		});

		video.on('data', () => updateAudioTrack());
		video.on('end', async () => {
			await updateAudioTrack(true)
			this.videoSrc_.loaded = true;
		});
		if (video.buffer.buffer.byteLength) {
			if (video.getWriteStream().promise.done)
				this.videoSrc_.loaded = true;
			updateAudioTrack();
		}
	}

	clearVideoSrc() {
		if (this.videoSrc_) {
			this.videoSrc_.removeAllListeners('data');
			this.videoSrc_.removeAllListeners('end');
			this.videoSrcDebouncer_.cancel();
			this.videoSrc_ = null;
		}
	}

	set shuffle(value) {
		this.$('#shuffle').checked = value;
	}

	set focus(value) {
		this.focus_ = value;
		this.$('#visualizer').animate = value;
	}

	onTimeChange_() {
		this.$('#time-bar').progress = this.audioTrack_.time / this.audioTrack_.duration;
		this.$('#time-bar').preValue = Player.timeFormat(this.audioTrack_.time);
		this.$('#time-bar').postValue = Player.timeFormat(this.audioTrack_.duration);
	}

	onEnd_() {
		if (!this.videoSrc_ || this.videoSrc_.loaded)
			this.emit('next');
	}

	onSetTime_(time) {
		this.audioTrack_.time = time * this.audioTrack_.duration;
		this.onTimeChange_();
	}

	onPrev_() {
		const PREVIOUS_SONG_THRESHOLD_S = 5;
		if (this.audioTrack_.time < PREVIOUS_SONG_THRESHOLD_S)
			this.emit('prev');
		else
			this.onSetTime_(0);
	}

	onPauseSet_(pause) {
		if (pause)
			this.audioTrack_.pause();
		else {
			this.audioTrack_.play();
			this.emit('player-play', null, {composed: true});
		}
		this.$('#pause').checked = !this.audioTrack_.paused;
	}

	pauseToggle_() {
		this.onPauseSet_(!this.audioTrack_.paused);
	}

	stopPlay() {
		this.onPauseSet_(true);
	}

	onShuffleSet_(shuffle) {
		this.shuffle = shuffle;
		storage.shufflePreference = this.$('#shuffle').checked;
		this.emit('shuffle', shuffle);
	}

	seek_(deltaS) {
		this.audioTrack_.time = Math.min(this.audioTrack_.time + deltaS, this.audioTrack_.duration);
		this.onTimeChange_();
	}

	seekBackward_() {
		this.seek_(-SEEK_DELTA_S);
	}

	seekForward_() {
		this.seek_(SEEK_DELTA_S);
	}

	handleKeypress_(e) {
		if (!this.focus_)
			return;

		switch (e.key) {
			case 'ArrowLeft':
				this.onPrev_();
				break;
			case 'ArrowRight':
				this.onEnd_();
				break;
			case 'ArrowDown':
			case ' ':
				this.pauseToggle_();
				break;
			case ',':
				this.seekBackward_();
				break;
			case '.':
				this.seekForward_();
				break;
		}
	}

	static timeFormat(seconds) {
		seconds = parseInt(seconds);
		let remainderSeconds = Player.num2str(seconds % 60, 2);
		let minutes = Player.num2str((seconds - remainderSeconds) / 60);
		return `${minutes}:${remainderSeconds}`;
	}

	static num2str(number, length) {
		return number.toString().padStart(length, 0);
	}
});
