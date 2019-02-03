const styleSharing = require('shadow-dom-style-sharing');
require('./xelements/import');

document.addEventListener('DOMContentLoaded', () => {
	let $ = query =>
		document.querySelector(query);

	styleSharing.process(document);
});

// todo
// refresh download frame status and player and list when deleting song
// notifications on download and song change
// fix playlist panel button fa icons
// ui to have less refresh buttons, automatically refresh player and list on new download
// ui to look good
// consistent file capitalization
