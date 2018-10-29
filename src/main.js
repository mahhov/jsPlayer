const bb = require('bb-better-binding')();
// bb.declareBlock('todoList', require('./todoListBlock/todoList'));


// navigator.serviceWorker.register('sw.js');
//
// const $ = document.getElementById.bind(document);
//
// window.customElements.define('playlist-item', class extends HTMLElement {
// 	constructor() {
// 		super();
// 		this.attachShadow({mode: 'open'});
// 		this.containerDiv = document.createElement('div');
// 		this.name = document.createElement('div');
// 		this.controls = document.createElement('div');
//
//
// 		this.shadowRoot.appendChild(containerDiv);
// 	}
//
// 	update(list)
//
// });
//
document.addEventListener('DOMContentLoaded', () => {
	const source = bb.boot(document.body);

	source.list = ['The Elephant\'s Todo List', '2'];

// 	let installEvent;
// 	window.addEventListener('beforeinstallprompt', event => {
// 		$('install-button').hidden = false;
// 		installEvent = event;
//
// 	});
// 	$('install-button').addEventListener('click', event => installEvent.prompt());
//
// 	$('directory-selector').addEventListener('change', (e) => {
// 		let files = [...$('directory-selector').files];
//
// 	});
});
