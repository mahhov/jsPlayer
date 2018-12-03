const path = require('path');
const {app, BrowserWindow} = require('electron');


app.on('ready', () => {
	let window = new BrowserWindow({width: 1000, height: 700});
	window.webContents.openDevTools();
	window.loadFile(path.resolve(__dirname, 'index.html'))
});
