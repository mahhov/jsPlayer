const styleSharing = require('shadow-dom-style-sharing');
require('./xelements/import');

document.addEventListener('DOMContentLoaded', () => {
	let $ = query =>
		document.querySelector(query);

	styleSharing.process(document);
});

// todo
// persistent playlist list, shuffle, volume
// notifications on download and song change
// keyboard shortcuts, global and local, skip/rewind 5 seconds, skip/rewind song, pause play
// ui to have less refresh buttons, automatically refresh player and list on new download
// way to delete songs from list, and refresh download frame status and player
// ui to look good
// select player song from clicking on song from list
