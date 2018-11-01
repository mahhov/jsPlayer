document.addEventListener('DOMContentLoaded', () => {
	// create style sheets for each shadow root to which we will later add rules
	let shadowRootsStyleSheets = [...document.querySelectorAll('*')]
		.filter(element => element.shadowRoot)
		.map(element => element.shadowRoot)
		.map(shadowRoot => {
			shadowRoot.appendChild(document.createElement('style'));
			return shadowRoot.styleSheets[0];
		});

	// iterate all style rules in the document searching for `.theme` and `.part` in the selectors.
	[...document.styleSheets]
		.flatMap(styleSheet => [...styleSheet.rules])
		.forEach(rule => {
			let styleText = rule.cssText.match(/\{(.*)\}/)[1];

			let selectorText = rule.selectorText || ':host';
			let match;
			if (match = selectorText.match(/\.theme\b(.*)/))
				shadowRootsStyleSheets.forEach(styleSheet => styleSheet.addRule(match[1], styleText));
			else if (match = selectorText.match(/\.part\b(.*)/))
				shadowRootsStyleSheets.forEach(styleSheet => styleSheet.addRule(`[part=${match[1]}]`, styleText));
		});
});
