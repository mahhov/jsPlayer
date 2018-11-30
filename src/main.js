const styleSharing = require('shadow-dom-style-sharing');
require('./xelements/import');

const SongStorage = require('./storage/SongStorage');
const songStorage = new SongStorage();
// songStorage.writeSong({id: 3, title: 'title', audioData: 'xcxcxxxcx'})
// songStorage.getAllSongs().then(x => console.log(x))

document.addEventListener('DOMContentLoaded', () => {
	let $ = query =>
		document.querySelector(query);

	$('#song-list').list = [
		'flamingo',
		'elemphant',
		'mouse',
	];

	$('#song-list').addEventListener('song-select', ({detail}) => console.log(detail));

	$('x-player').addEventListener('end', () => {
		console.log('ended caught by main.js');
	});

	// $('x-playlist-panel').list = [
	// 	{title: 'x-playlist-panel', count: 3, id: 'OLAK5uy_mt1gUnCahoe2g5rYOCCxLU_pMxBxcSbPw'},
	// 	{title: 'my playlist name', count: 300, id: 'OLAK5uy_mt1gUnCahoe2g5rYOCCxLU_pMxBxcSbPw'},
	// 	{title: 'new', count: 1400, id: 'OLAK5uy_mt1gUnCahoe2g5rYOCCxLU_pMxBxcSbPw'},
	// ];

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
