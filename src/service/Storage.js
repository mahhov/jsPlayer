const path = require('path');
const fs = require('fs').promises;
const rootPath = require('env-paths')('js-player').data;

const STORAGE_DIR = rootPath;
const PLAYLIST_LIST = 'playlistList.json';
const DOWNLOAD_DIR = 'downloads';
const PLAYER_SETTINGS = 'playerSettings.json';

class Storage {
	constructor(storageDir, playlistList, downloadDir, playerSettings) {
		this.storageDir_ = path.resolve(storageDir);
		this.playlistList_ = path.resolve(storageDir, playlistList);
		this.downloadDir_ = path.resolve(storageDir, downloadDir);
		this.playerSettings_ = path.resolve(storageDir, playerSettings);

		this.prepareDir_();
	}

	get downloadDir() {
		return this.downloadDir_;
	}

	prepareDir_() {
		return this.prepareDirPromise_ = this.prepareDirPromise_ || new Promise(async resolve => {
			await fs.mkdir(this.storageDir_).catch(() => null);
			await fs.mkdir(this.downloadDir_).catch(() => null);
			resolve();
		});
	}

	get playlistList() {
		return this.playlistListPromise_ = this.playlistListPromise_ ||
			this.prepareDir_()
				.then(() => fs.readFile(this.playlistList_, 'utf8'))
				.then(a => JSON.parse(a))
				.catch(() => []);
	}

	set playlistList(playlistList) {
		this.prepareDir_()
			.then(() => fs.writeFile(this.playlistList_, JSON.stringify(playlistList)))
			.then(() => this.playlistListPromise_ = Promise.resolve(playlistList))
			.catch(e => console.error('error saving playlist lists:', e));
	}

	get songList() {
		return this.songListPromise_ = this.songListPromise_ ||
			this.prepareDir_().then(() => fs.readdir(this.downloadDir_));
	}

	async removeSong(songName) {
		await this.prepareDir_();
		await fs.unlink(path.resolve(this.downloadDir_, songName));
		this.songListPromise_ = Promise.resolve((await this.songListPromise_).filter(a => a === songName));
	}

	async readSong(songName) {
		await this.prepareDir_();
		return fs.readFile(path.resolve(this.downloadDir_, songName));
	}

	get playerSettings() {
		return this.playerSettingsPromise_ = this.playerSettingsPromise_ ||
			this.prepareDir_()
				.then(() => fs.readFile(this.playerSettings_, 'utf8'))
				.then(a => JSON.parse(a))
				.catch(() => ({}));
	}

	set playerSettings(playerSettings) {
		this.prepareDir_()
			.then(fs.writeFile(this.playerSettings_, JSON.stringify(playerSettings)))
			.then(() => this.playerSettingsPromise_ = Promise.resolve(playerSettings))
			.catch(e => console.error('error saving player settings:', e));
	}
}

module.exports = new Storage(STORAGE_DIR, PLAYLIST_LIST, DOWNLOAD_DIR, PLAYER_SETTINGS);
