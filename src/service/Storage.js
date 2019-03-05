const path = require('path');
const fs = require('fs').promises;
const rootPath = require('env-paths')('js-player').data;

const STORAGE_DIR = rootPath;
const PLAYLIST_LIST = 'playlistList.json';
const DOWNLOAD_DIR = 'downloads';
const PLAYER_SETTINGS = 'palyerSettings.json';

let prepareDir_ = () =>
	fs.mkdir(STORAGE_DIR, {recursive: true}).catch(() => null);

let getPlaylistList = async () => {
	await prepareDir_();
	return fs.readFile(path.resolve(STORAGE_DIR, PLAYLIST_LIST), 'utf8')
		.then(a => JSON.parse(a))
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

let readSong = songName => fs.readFile(path.resolve(getSongDir(), songName));

let getPlayerSettings = async () => {
	await prepareDir_();
	return fs.readFile(path.resolve(STORAGE_DIR, PLAYER_SETTINGS), 'utf8')
		.then(a => JSON.parse(a))
		.catch(() => ({}));
};

let savePlayerSettings = async playerSettings => {
	await prepareDir_();
	fs.writeFile(path.resolve(STORAGE_DIR, PLAYER_SETTINGS), JSON.stringify(playerSettings))
		.catch(e => console.error('error saving player settings:', e));
};

module.exports = {getPlaylistList, savePlaylistList, getSongDir, getSongList, getSong, removeSong, readSong, getPlayerSettings, savePlayerSettings};

// todo caching
