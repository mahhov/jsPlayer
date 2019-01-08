const path = require('path');
const fs = require('fs').promises;

const DATA_DIR = 'data';
const DOWNLOAD_DIR = 'downloads';

let getPlaylistList = () => {};

let getSongList = () =>
	fs.readdir(path.resolve(DATA_DIR, DOWNLOAD_DIR));

module.exports = {getSongList};
