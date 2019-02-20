const path = require('path');
const {app, BrowserWindow, globalShortcut} = require('electron');

// necessary for notifications
app.setAppUserModelId(process.execPath);

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

app.on('ready', () => {
	let window = new BrowserWindow({width: 1800, height: 1000});
	window.setMenu(null);
	window.loadFile(path.resolve(__dirname, 'index.html'));

	globalShortcut.register('MediaPreviousTrack', () => window.webContents.send('shortcutPrev'));
	globalShortcut.register('MediaNextTrack', () => window.webContents.send('shortcutNext'));
	globalShortcut.register('MediaPlayPause', () => window.webContents.send('shortcutPause'));
});
