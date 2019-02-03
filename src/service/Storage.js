const path = require('path');
const fs = require('fs').promises;

const STORAGE_DIR = 'data';
const PLAYLIST_LIST = 'playlistList.json';
const DOWNLOAD_DIR = 'downloads';
const PLAYER_SETTINGS = 'palyerSettings.json';

let prepareDir_ = async () => {
	await fs.mkdir(path.resolve(STORAGE_DIR)).catch(() => {});
	await fs.mkdir(path.resolve(STORAGE_DIR, DOWNLOAD_DIR)).catch(() => {});
	await fs.mkdir(path.resolve(STORAGE_DIR, DOWNLOAD_DIR)).catch(() => {});
};

let getPlaylistList = async () => {
	await prepareDir_();
	return fs.readFile(path.resolve(STORAGE_DIR, PLAYLIST_LIST))
		.then(a => JSON.parse(a.toString()))
		.catch(() => []);
};

let savePlaylistList = async playlistList => {
	await prepareDir_();
	fs.writeFile(path.resolve(STORAGE_DIR, PLAYLIST_LIST), JSON.stringify(playlistList))
		.catch(e => console.error('error saving playlist lists:', e));
};

// todo this should not be public?
let getSongDir = () => path.resolve(STORAGE_DIR, DOWNLOAD_DIR);

let getSongList = async () => {
	await prepareDir_();
	return fs.readdir(path.resolve(getSongDir()));
};

let getSong = songName => path.resolve(getSongDir(), songName);

let removeSong = songName => fs.unlink(getSong(songName));

let getPlayerSettings = async () => {
	await prepareDir_();
	return fs.readFile(path.resolve(STORAGE_DIR, PLAYER_SETTINGS))
		.then(a => JSON.parse(a.toString()))
		.catch(() => ({}));
};

let savePlayerSettings = async playerSettings => {
	await prepareDir_();
	fs.writeFile(path.resolve(STORAGE_DIR, PLAYER_SETTINGS), JSON.stringify(playerSettings))
		.catch(e => console.error('error saving player settings:', e));
};

module.exports = {getPlaylistList, savePlaylistList, getSongDir, getSongList, getSong, removeSong, getPlayerSettings, savePlayerSettings};

// todo caching
