const path = require('path');
const fs = require('fs').promises;
const rootPath = require('env-paths')('js-player').data;

console.log(rootPath);
const STORAGE_DIR = rootPath;
const PLAYLIST_LIST = 'playlistList.json';
const DOWNLOAD_DIR = 'downloads';
const FAVORITES = 'favorites.json';
const PLAYER_SETTINGS = 'playerSettings.json';

class Storage {
	constructor(storageDir, playlistList, downloadDir, favorites, playerSettings) {
		this.storageDir_ = path.resolve(storageDir);
		this.playlistList_ = path.resolve(storageDir, playlistList);
		this.downloadDir_ = path.resolve(storageDir, downloadDir);
		this.favorites_ = path.resolve(storageDir, favorites);
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

	async readSong(songName) {
		await this.prepareDir_();
		return fs.readFile(path.resolve(this.downloadDir_, songName));
	}

	async removeSong(songName) {
		await this.prepareDir_();
		await fs.unlink(path.resolve(this.downloadDir_, songName));
		this.songListPromise_ = Promise.resolve((await this.songListPromise_).filter(a => a === songName));
	}

	get favorites() {
		return this.favoritesPromise_ = this.favoritesPromise_ ||
			this.prepareDir_()
				.then(() => fs.readFile(this.favorites_, 'utf8'))
				.then(a => JSON.parse(a))
				.catch(() => ([]));
	}

	set favorites(favorites) {
		this.prepareDir_()
			.then(fs.writeFile(this.favorites_, JSON.stringify(favorites)))
			.then(() => this.favoritesPromise_ = Promise.resolve(favorites))
			.catch(e => console.error('error saving favorites:', e));
	}

	async isSongFavorite(name) {
		return (await this.favorites).includes(name);
	}

	async setSongFavorite(name, favorite) {
		let favorites = await this.favorites;
		if (favorite === favorites.includes(name))
			return;
		if (favorite)
			favorites.push(name);
		else
			favorites = favorites.filter(favorite => favorite !== name);
		this.favorites = favorites;
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

module.exports = new Storage(STORAGE_DIR, PLAYLIST_LIST, DOWNLOAD_DIR, FAVORITES, PLAYER_SETTINGS);
