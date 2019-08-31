const template = require('fs').readFileSync(`${__dirname}/downloadingSongLine.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-downloading-song-line', class extends XElement {
		static get observedAttributes() {
			return ['title', 'status', 'playlist-status', 'download-status', 'play-status'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			if (!this.hasAttribute('title'))
				this.setAttribute('title', '');
			if (!this.hasAttribute('status'))
				this.setAttribute('status', '');
			// todo initialize to null
			// if (!this.hasAttribute('playlist-status'))
			// 	this.removeAttribute('playlist-status');
			// if (!this.hasAttribute('download-status'))
			// 	this.removeAttribute('download-status');
			// if (!this.hasAttribute('play-status'))
			// 	this.removeAttribute('play-status');

			this.$('#container').addEventListener('click', () => this.emitSelect_());
		}

		get title() {
			return this.getAttribute('title');
		}

		set title(value) {
			this.setAttribute('title', value);
		}

		get status() {
			return this.getAttribute('status');
		}

		set status(value) {
			this.setAttribute('status', value);
		}

		get playlistStatus() {
			return this.getAttribute('playlist-status'); // todo return true, false, null rather than 'true', 'false', null
		}

		set playlistStatus(value) {
			if (value === null)
				this.removeAttribute('playlist-status');
			else
				this.setAttribute('playlist-status', value);
		}

		get downloadStatus() {
			return this.getAttribute('download-status');
		}

		set downloadStatus(value) {
			if (value === null)
				this.removeAttribute('download-status');
			else
				this.setAttribute('download-status', value);
		}

		get playStatus() {
			return this.getAttribute('play-status');
		}

		set playStatus(value) {
			if (value === null)
				this.removeAttribute('play-status');
			else
				this.setAttribute('play-status', value);
		}

		attributeChangedCallback(name, oldValue, newValue) {
			switch (name) {
				case 'title':
					this.$(`#title`).textContent = newValue;
					break;
				case 'status':
					this.$(`#status`).textContent = newValue;
					break;
				case 'playlist-status':
					this.$('#container').classList.toggle('playlist-added', newValue === 'true');
					this.$('#container').classList.toggle('playlist-not-added', newValue === 'false');
					this.$('#container').classList.toggle('playlist-undetermined', newValue === null);
					break;
				case 'download-status':
					this.$('#container').classList.toggle('download-success', newValue === 'true');
					this.$('#container').classList.toggle('download-fail', newValue === 'false');
					this.$('#container').classList.toggle('download-undetermined', newValue === null);
					break;
				case 'play-status':
					this.$('#container').classList.toggle('selected', newValue === 'true'); // for element.css
					this.$('#container').classList.toggle('play-playing', newValue === 'true'); // for consistency
					this.$('#container').classList.toggle('play-played', newValue === 'false');
					this.$('#container').classList.toggle('play-unplayed', newValue === null);
					break;
			}
		}

		emitSelect_() {
			this.dispatchEvent(new CustomEvent('select'));
		}
	}
);
