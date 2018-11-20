const styleSharing = require('shadow-dom-style-sharing');
require('./xelements/import');
const SongStorage = require('./storage/SongStorage');

const songStorage = new SongStorage();

// navigator.serviceWorker.register('sw.js');
//
// window.customElements.define('playlist-item', class extends HTMLElement {
// 	constructor() {
// 		super();
// 		this.attachShadow({mode: 'open'});
// 		this.containerDiv = document.createElement('div');
// 		this.name = document.createElement('div');
// 		this.controls = document.createElement('div');
//
//
// 		this.shadowRoot.appendChild(containerDiv);
// 	}
//
// 	update(list)
//
// });
//

// songStorage.writeSong({id: 3, title: 'title', audioData: 'xcxcxxxcx'})
// songStorage.getAllSongs().then(x => console.log(x))

document.addEventListener('DOMContentLoaded', () => {
	$('#song-list').list = [
		{title: 'flamingo', index: 3},
		{title: 'elemphant', index: 8},
		{title: 'mouse', index: 0},
	];

	styleSharing.process(document);

// 	let installEvent;
// 	window.addEventListener('beforeinstallprompt', event => {
// 		$('install-button').hidden = false;
// 		installEvent = event;
//
// 	});
// 	$('install-button').addEventListener('click', event => installEvent.prompt());
//
// 	$('directory-selector').addEventListener('change', (e) => {
// 		let files = [...$('directory-selector').files];
//
// 	});
});
