const template = require('fs').readFileSync(`${__dirname}/playlistPanel.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-playlist-panel', class extends XElement {
		constructor() {
			super(template);
		}

		set list(playlists) {
			let listDiv = this.$('#list');
			XElement.clearChildren(listDiv);

			this.items_ = playlists.map(({title, count, id}, index) => {
				let element = document.createElement('x-playlist-panel-item');
				element.title = title;
				element.count = count;
				element.id = id;
				return element;
			});
			this.items_.forEach((element, index) => {
				listDiv.appendChild(element);
				element.addEventListener('synch', () => this.onSynch_(index));
			});
		}

		onSynch_(index) {
			this.dispatchEvent(new CustomEvent('song-select', {detail: index}));
		}
	}
);

// let playlists = [{
// 	title: '',
// 	count: 0,
// 	id: ''
// }];
