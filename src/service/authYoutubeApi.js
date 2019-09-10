const http = require('http');
const axios = require('axios');
const GoogleAuth = require('google-oauth2-x');
const storage = require('./Storage');
const {shell} = require('electron');

const API_ENDPOINT = 'https://www.googleapis.com/youtube/v3';

let endpoint = (path, params = {}) => `${API_ENDPOINT}/${path}?${queryParams(params)}`;

const queryParams = (params = {}) =>
	Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');

class AuthYoutubeApi extends GoogleAuth {
	openConsentScreen_() {
		return new Promise(resolve => {
			let server = http.createServer((req, res) => {
				resolve(req.url);
				res.end('thanks');
				server.close();
			}).listen();
			let port = server.address().port;
			let endpoint = this.getConsentScreenEndpoint_(`http://localhost:${port}`);
			shell.openExternal(endpoint);
		});
	}

	async includes(playlistId, videoId) {
		return (await axios.get(
			endpoint('playlistItems', {part: 'snippet', playlistId, videoId}),
			{headers: await this.getHeaders_()}))
			.data.items.map(item => item.id);
	}

	async add(playlistId, videoId) {
		return axios.post(
			endpoint('playlistItems', {part: 'snippet'}),
			{
				snippet: {
					playlistId,
					resourceId: {
						videoId,
						kind: 'youtube#video',
					}
				}
			},
			{headers: await this.getHeaders_()});
	};

	async remove(videoPlaylistItemId) {
		return axios.delete(
			endpoint('playlistItems', {id: videoPlaylistItemId}),
			{headers: await this.getHeaders_()});
	}

	async getHeaders_() {
		return this.headers_ = this.headers_ || {
			Authorization: `Bearer ${await this.getToken()}`,
			'Content-Type': 'application/json',
		};
	}
}

module.exports = new AuthYoutubeApi(
	'resources/googleCredentials.json',
	storage.getStoragePath('googleTokens.json'),
	'https://www.googleapis.com/auth/youtube');

// todo if request fails, try with refresh token. If refreshed token also fails, try with new code.
