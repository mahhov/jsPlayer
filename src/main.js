const styleSharing = require('shadow-dom-style-sharing');
require('./xelements/import');

document.addEventListener('DOMContentLoaded', () => {
	let $ = query =>
		document.querySelector(query);

	styleSharing.process(document);
});
