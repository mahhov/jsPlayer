const fs = require('fs').promises;
const DOWNLOAD_DIR = 'downloads';

let getSongList = () =>
	fs.readdir(DOWNLOAD_DIR);

module.exports = {getSongList};
