const http = require('http');
const axios = require('axios');
const GoogleAuth = require('google-oauth2-x');
const storage = require('./Storage');
const {shell} = require('electron');

const API_ENDPOINT = 'https://www.googleapis.com/youtube/v3';

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

	// todo why is this being called twice per video
	async includes(playlistId, videoId) {
		return (await this.twoTryRequest_('get', {part: 'snippet', playlistId, videoId}))
			.data.items.map(item => item.id);
	}

	add(playlistId, videoId) {
		return this.twoTryRequest_('post', {part: 'snippet'},
			{
				snippet: {
					playlistId,
					resourceId: {
						videoId,
						kind: 'youtube#video',
					}
				}
			});
	};

	remove(videoPlaylistItemId) {
		return this.twoTryRequest_('delete', {id: videoPlaylistItemId});
	}

	async twoTryRequest_(method, params = {}, body = undefined) {
		let paramsString = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
		let request = {
			method,
			url: `${API_ENDPOINT}/playlistItems?${paramsString}`,
			headers: await this.getHeaders_(),
			data: body,
		};
		try {
			return await axios(request);
		} catch (e) {
			this.getRefreshedToken();
			request.headers = await this.getHeaders_();
			return await axios(request);
		}
	}

	async getHeaders_() {
		return this.headers_ = this.headers_ || {
			Authorization: `Bearer ${await this.getToken()}`,
			'Content-Type': 'application/json',
		};
	}
}

// todo correct paths
module.exports = new AuthYoutubeApi(
	'resources/googleCredentials.json',
	storage.getStoragePath('googleTokens.json'),
	'https://www.googleapis.com/auth/youtube');