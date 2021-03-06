const snekfetch = require('snekfetch');
const { config } = require('../config');

const giphyKey = config.giphyKey;
const giphyApi = 'https://api.giphy.com/v1/gifs/';

const gif = (message) => {
	const query = message.argsString;

	snekfetch.get(giphyApi + 'search', {
		query: {
			api_key: giphyKey,
			q: query,
		},
	}).then(response => {
		if(response.body.data.length < 1) return;

		const gifs = response.body.data;

		message.channel.send(gifs[0].url);
	});
};

const gifRandom = (message) => {
	const query = message.argsString;

	snekfetch.get(giphyApi + 'search', {
		query: {
			api_key: giphyKey,
			q: query,
			limit: 100,
		},
	}).then(response => {
		if(response.body.data.length < 1) return;

		const gifResp = response.body.data;
		const gifIdx = Math.floor(Math.random() * response.body.pagination.count);

		message.channel.send(gifResp[gifIdx].url);
	});
};

module.exports = {
	name: 'Gifs',
	commands: [
		{
			triggers: ['!gif'],
			execute: gif,
		},
		{
			triggers: ['!gifr'],
			execute: gifRandom,
		},
	],
};