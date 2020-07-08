const ipc = require('electron').ipcRenderer;

let globalShortcutEvents = {
	PREV: 'PREV',
	NEXT: 'NEXT',
	PAUSE: 'PAUSE',
	BACKWARD: 'BACKWARD',
	FORWARD: 'FORWARD',
};

let addGlobalShortcutListener = (event, handler) => ipc.on(event, handler);

let addListenerKeydown = handler => document.addEventListener('keydown', e => {
	if (e.path[0].hasAttribute('consume-key') && e.key === 'Escape')
		e.path[0].blur();
	if (!e.repeat && !e.path[0].hasAttribute('consume-key'))
		handler(e);
});

module.exports = {globalShortcutEvents, addGlobalShortcutListener, addListenerKeydown};
