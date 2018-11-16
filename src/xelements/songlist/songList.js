const template = require('fs').readFileSync(`${__dirname}/songList.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-song-list', class extends XElement {
		constructor() {
			super(template);
		}

		set list(titles) {
			let listDiv = this.$('#list');
			XElement.clearChildren(listDiv);

			this.items_ = titles.map((title, index) => {
				let element = document.createElement('x-song-list-item');
				element.title = title;
				element.number = index;
				return element;
			});
			this.items_.forEach((element, index) => {
				listDiv.appendChild(element);
				element.addEventListener('click', () => this.onSongSelect_(index));
			});
		}

		setSelectedSong(index) {
			this.items_[index].selected = true;
		}

		onSongSelect_(index) {
			this.dispatchEvent(new CustomEvent('song-select', {detail: index}));
		}
	}
);
