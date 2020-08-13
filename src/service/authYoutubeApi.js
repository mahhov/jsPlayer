const path = require('path');
const http = require('http');
const axios = require('axios');
const GoogleAuth = require('google-oauth2-x');
const storage = require('./storage');
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

	authenticate() {
		this.getCleanToken(true);
	}

	async includes(playlistId, videoId) {
		return (await this.twoTryRequest_('get', {part: 'id', playlistId, videoId}))
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

	twoTryPlaylistItemsRequest_(method, params = {}, body = undefined) {
		let paramsString = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
		let request = {
			method,
			url: `${API_ENDPOINT}/playlistItems?${paramsString}`,
			data: body,
		};
		return this.twoTryRequest_(async () => {
			request.headers = await this.getHeaders();
			return axios(request);
		});
	}

	download(video) {
		return this.twoTryRequest_(async () => {
			let requestOptions = {filter: 'audioonly', requestOptions: {headers: await this.getHeaders()}};
			return video.getWriteStream(requestOptions).promise;
		});
	}

	async twoTryRequest_(doRequest) {
		try {
			return await doRequest();
		} catch (e) {
			await this.getRefreshedToken();
			return await doRequest();
		}
	}

	async getHeaders() {
		return {
			Authorization: `Bearer ${await this.getToken()}`,
			'Content-Type': 'application/json',
		};
	}
}

module.exports = new AuthYoutubeApi(
	path.join(__dirname, '../../resources/googleCredentials.json'),
	storage.getStoragePath('googleTokens.json'),
	'https://www.googleapis.com/auth/youtube');
