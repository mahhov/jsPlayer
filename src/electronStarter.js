const path = require('path');
const {app, BrowserWindow} = require('electron');


app.on('ready', () => {
	let window = new BrowserWindow({width: 1800, height: 1000});
	window.webContents.openDevTools();
	window.loadFile(path.resolve(__dirname, 'index.html'))
});
