const ipc = require('electron').ipcRenderer;

let addListenerGlobalPrev = handler => ipc.on('shortcutPrev', handler);

let addListenerGlobalNext = handler => ipc.on('shortcutNext', handler);

let addListenerGlobalPause = handler => ipc.on('shortcutPause', handler);

let addListenerKeydown = handler => document.addEventListener('keydown', e => {
	if (!e.repeat && !e.path[0].hasAttribute('consume-key'))
		handler(e);
});

module.exports = {addListenerGlobalPrev, addListenerGlobalNext, addListenerGlobalPause, addListenerKeydown};
