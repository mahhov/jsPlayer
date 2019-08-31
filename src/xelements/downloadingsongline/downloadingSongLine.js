const template = require('fs').readFileSync(`${__dirname}/downloadingSongLine.html`, 'utf8');
const XElement = require('../XElement2');

customElements.define('x-downloading-song-line', class extends XElement {
		static get attributeTypes() {
			return {
				title: false,
				status: false,
				playlistStatus: false,
				downloadStatus: false,
				playStatus: false,
			};
		}

		static get htmlTemplate() {
			return template;
		}

		connectedCallback() {
			this.playlistStatus = 'undetermined';
			this.downloadStatus = 'undetermined';
			this.playStatus = 'undetermined';
			this.$('#container').addEventListener('click', () => this.emitSelect_());
		}

		set title(value) {
			this.$(`#title`).textContent = value;
		}

		set status(value) {
			this.$(`#status`).textContent = value;
		}

		set playlistStatus(value) {
			this.$('#container').classList.toggle('playlist-added', value === 'true');
			this.$('#container').classList.toggle('playlist-not-added', value === 'false');
			this.$('#container').classList.toggle('playlist-undetermined', value === 'undetermined');
		}

		set downloadStatus(value) {
			this.$('#container').classList.toggle('download-success', value === 'true');
			this.$('#container').classList.toggle('download-fail', value === 'false');
			this.$('#container').classList.toggle('download-undetermined', value === 'undetermined');
		}

		set playStatus(value) {
			this.$('#container').classList.toggle('selected', value === 'true'); // for element.css
			this.$('#container').classList.toggle('play-playing', value === 'true'); // for consistency
			this.$('#container').classList.toggle('play-played', value === 'false');
			this.$('#container').classList.toggle('play-unplayed', value === 'undetermined');
		}

		emitSelect_() {
			this.dispatchEvent(new CustomEvent('select'));
		}
	}
);
