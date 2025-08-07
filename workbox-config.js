module.exports = {
	globDirectory: 'app/',
	globPatterns: [
		'**/*.{ts,ico,css,tsx}'
	],
	swDest: 'public/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};