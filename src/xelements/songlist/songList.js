const template = require('fs').readFileSync(`${__dirname}/songList.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-song-list', class extends XElement {
		constructor() {
			super(template);
		}

		set list(songs) {
			let listDiv = this.$('#list');
			XElement.clearChildren(listDiv);
			songs
				.sort(({index: i}, {index: j}) => i - j)
				.map(({title, index, ...song}) => {
					let element = document.createElement('x-song-list-item');
					element.title = title;
					element.number = index;
					return {title, index, ...song, element};
				})
				.forEach(({element, ...song}) => {
					listDiv.appendChild(element);
					element.addEventListener('click', () => this.onSongSelect_(song));
				});
		}

		onSongSelect_(song) {
			this.dispatchEvent(new CustomEvent('song-select', {detail: song}));
		}
	}
);