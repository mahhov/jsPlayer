const dwytpl = require('dwytpl');

let cache = {};

let getPlaylist = id => cache[id] = cache[id] || new dwytpl.Playlist(id);

let getUncachedPlaylist = id => cache[id] = new dwytpl.Playlist(id);

module.exports = {getPlaylist, getUncachedPlaylist};
