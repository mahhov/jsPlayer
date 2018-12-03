const path = require('path');
const {app, BrowserWindow} = require('electron');


app.on('ready', () =>
	new BrowserWindow({width: 1500, height: 1000})
		.loadFile(path.resolve(__dirname, 'index.html')));
