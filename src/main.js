const styleSharing = require('shadow-dom-style-sharing');
require('./xelements/import');

// const SongStorage = require('./storage/SongStorage');
// const songStorage = new SongStorage();
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

	styleSharing.process(document);
});
