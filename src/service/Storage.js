const path = require('path');
const fs = require('fs').promises;
const rootPath = require('env-paths')('js-player').data;

console.log(rootPath);
const STORAGE_DIR = rootPath;
const PLAYLIST_LIST = 'playlistList.json';
const DOWNLOAD_DIR = 'downloads';
const EXPLORER_DOWNLOAD_DIR = 'tempDownloads';
const FAVORITES = 'favorites.json';
const PLAYER_SETTINGS = 'playerSettings.json';

class Storage {
	constructor(storageDir, playlistList, downloadDir, explorerDownloadDir, favorites, playerSettings) {
		this.storageDir_ = path.resolve(storageDir);
		this.playlistList_ = path.resolve(storageDir, playlistList);
		this.downloadDir_ = path.resolve(storageDir, downloadDir);
		this.explorerDownloadDir_ = path.resolve(storageDir, explorerDownloadDir);
		this.favoritesPath_ = path.resolve(storageDir, favorites);
		this.playerSettings_ = path.resolve(storageDir, playerSettings);

		this.prepareDir_();
	}

	get downloadDir() {
		return this.downloadDir_;
	}

	get explorerDownloadDir() {
		return this.explorerDownloadDir_;
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
		this.playlistListPromise_ = Promise.resolve(playlistList);
		this.prepareDir_()
			.then(() => fs.writeFile(this.playlistList_, JSON.stringify(playlistList)))
			.catch(e => console.error('error saving playlist lists:', e));
	}

	get songList() {
		return this.songListPromise_ = this.songListPromise_ ||
			this.prepareDir_().then(() => fs.readdir(this.downloadDir_));
	}

	async readSong(songName) {
		await this.prepareDir_();
		try {
			return await fs.readFile(path.resolve(this.downloadDir_, songName));
		} catch {
			return fs.readFile(path.resolve(this.explorerDownloadDir_, songName))
		}
	}

	async removeSong(songName) {
		this.songListPromise_ = Promise.resolve((await this.songListPromise_).filter(a => a !== songName));
		await this.prepareDir_();
		await fs.unlink(path.resolve(this.downloadDir_, songName));
	}

	get favorites_() {
		return this.favoritesPromise_ = this.favoritesPromise_ ||
			this.prepareDir_()
				.then(() => fs.readFile(this.favoritesPath_, 'utf8'))
				.then(a => JSON.parse(a))
				.catch(() => ({}));
	}

	async isSongFavorite(name) {
		return (await this.favorites_)[name];
	}

	async setSongFavorite(name, favorite) {
		let favorites = await this.favorites_;
		favorites[name] = favorite;
		this.prepareDir_()
			.then(() => fs.writeFile(this.favoritesPath_, JSON.stringify(favorites)))
			.catch(e => console.error('error saving favorites:', e));
	}

	get playerSettings() {
		return this.playerSettingsPromise_ = this.playerSettingsPromise_ ||
			this.prepareDir_()
				.then(() => fs.readFile(this.playerSettings_, 'utf8'))
				.then(a => JSON.parse(a))
				.catch(() => ({}));
	}

	async addPlayerSettings(playerSettings) {
		this.playerSettings = {...await this.playerSettings, ...playerSettings};
	}

	set playerSettings(playerSettings) {
		this.playerSettingsPromise_ = Promise.resolve(playerSettings);
		this.prepareDir_()
			.then(() => fs.writeFile(this.playerSettings_, JSON.stringify(playerSettings)))
			.catch(e => console.error('error saving player settings:', e));
	}
}

module.exports = new Storage(STORAGE_DIR, PLAYLIST_LIST, DOWNLOAD_DIR, EXPLORER_DOWNLOAD_DIR, FAVORITES, PLAYER_SETTINGS);
