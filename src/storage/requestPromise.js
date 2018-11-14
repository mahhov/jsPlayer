let requestp = (request, actionLogString) => {
	request.upgradep = new Promise(resolve =>
		request.onupgradeneeded = ({target: {result: r}}) => resolve(r));
	request.successp = new Promise(resolve =>
		request.onsuccess = ({target: {result: r}}) => resolve(r));
	request.completep = new Promise(resolve =>
		request.oncomplete = ({target: {result: r}}) => resolve(r));
	request.errorp = new Promise(resolve =>
		request.onerror = resolve);
	request.abortp = new Promise(resolve =>
		request.onabort = resolve);

	request.errorp.then(error => console.log('failed to', actionLogString, error));
	request.abortp.then(error => console.log('failed to', actionLogString, error));

	return request;
};

module.exports = requestp;
