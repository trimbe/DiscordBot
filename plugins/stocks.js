const snekfetch = require('snekfetch');

const stockPrice = (message) => {
	if(!message.content.startsWith('$')) return;

	const symbolQuery = message.content.split(' ')[0].replace('$', '').toUpperCase();
	const apiUrl = `https://query1.finance.yahoo.com/v7/finance/options/${symbolQuery}`;
	console.time('stock');
	snekfetch.get(apiUrl)
		.then(response => {
			console.timeEnd('stock');
			if(!response.body.optionChain.result[0].quote) return;
			const quote = response.body.optionChain.result[0].quote;

			let price = quote.regularMarketPrice;
			if(price == 0) return;
			const prevClose = quote.regularMarketPreviousClose;
			const currency = quote.currency;
			const symbol = quote.symbol;
			const name = quote.longName;
			let change = (((price - prevClose) / prevClose) * 100).toFixed(2);
			price = price.toLocaleString('en-US', { style: 'currency', currency: currency });

			if((quote.marketState.includes('POST') || quote.marketState.includes('CLOSED')) && quote.market == "us_market") {
				price = quote.postMarketPrice;
				price = price.toLocaleString('en-US', { style: 'currency', currency: currency });
				change = quote.postMarketChangePercent.toFixed(2);
			}

			let messageResult = `${symbol} - ${name} : ${price} (${change}%)`;
			if((quote.marketState.includes('POST') || quote.marketState.includes('CLOSED')) && quote.market == "us_market") messageResult += ' [After Hours]';
			message.channel.send(messageResult);
		}).catch(error => {
			// Invalid stock symbol
			if(error.status == 404) return;
			console.log(error);
		});
};

const updateStockPlaying = (client) => {
	const apiUrl = 'https://query1.finance.yahoo.com/v7/finance/options/TSLA';
	snekfetch.get(apiUrl)
		.then(response => {
			if(!response.body.optionChain.result[0].quote) return;
			const quote = response.body.optionChain.result[0].quote;

			let price = quote.regularMarketPrice;
			if(price == 0) return;
			const prevClose = quote.regularMarketPreviousClose;
			const currency = quote.currency;
			let change = (((price - prevClose) / prevClose) * 100).toFixed(2);
			price = price.toLocaleString('en-US', { style: 'currency', currency: currency });

			if((quote.marketState.includes('POST') || quote.marketState.includes('CLOSED')) && quote.market == "us_market") {
				price = quote.postMarketPrice;
				price = price.toLocaleString('en-US', { style: 'currency', currency: currency });
				change = quote.postMarketChangePercent.toFixed(2);
			}

			let messageResult = `${price} (${change}%)`;
			if((quote.marketState.includes('POST') || quote.marketState.includes('CLOSED')) && quote.market == "us_market") messageResult += ' [After Hours]';
			client.user.setActivity(messageResult)
				.catch(error => {
					console.log(error);
				});
		}).catch(error => {
			// Invalid stock symbol
			if(error.status == 404) return;
			console.log(error);
		});
};

module.exports = {
	name: 'Stock Prices',
	commands: [
		{
			execute: stockPrice,
			isListener: true,
		},
	],
	updateStockPlaying,
};