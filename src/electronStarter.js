const path = require('path');
const {app, BrowserWindow, globalShortcut, powerSaveBlocker} = require('electron');

// necessary for notifications
app.setAppUserModelId(process.execPath);

// avoid display dimming and sleeping
powerSaveBlocker.start('prevent-display-sleep');

app.on('ready', () => {
	let window = new BrowserWindow({width: 1800, height: 1000, webPreferences: {nodeIntegration: true}});
	window.setMenu(null);
	window.webContents.openDevTools();
	window.loadFile(path.resolve(__dirname, 'index.html'));

	globalShortcut.register('MediaPreviousTrack', () => window.webContents.send('shortcutPrev'));
	globalShortcut.register('MediaNextTrack', () => window.webContents.send('shortcutNext'));
	globalShortcut.register('MediaPlayPause', () => window.webContents.send('shortcutPause'));
});

app.once('window-all-closed', app.quit);
