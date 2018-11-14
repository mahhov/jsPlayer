const requestp = require('./requestPromise');

class SongStorage {
	constructor() {
		this.open = requestp(indexedDB.open('songsDb'), 'open db');
		this.open.upgradep.then(db => db.createObjectStore('songs', {keyPath: 'id'}));
	}

	writeSong(song) {
		this.open.successp.then(db => {
			let songStore = db.transaction('songs', 'readwrite').objectStore('songs');
			requestp(songStore.put(song), 'write song');
		});
	}

	getAllSongs() {
		return this.open.successp.then(db => {
			let songsStore = db.transaction('songs').objectStore('songs');
			return requestp(songsStore.getAll(), 'get all songs').successp;
		});
	}
}

module.exports = SongStorage;
