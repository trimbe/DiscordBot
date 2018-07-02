const discord = require('discord.js');
const snekfetch = require('snekfetch');
const { config } = require('../config');

const weather = (message) => {
	const queryLocation = message.argsString;

	const weatherApi = 'http://api.openweathermap.org/data/2.5/weather';
	const weatherKey = config.openWeatherMapKey;

	const geocodeApi = 'https://maps.googleapis.com/maps/api/geocode/json';
	const geocodeKey = config.googleGeocodeKey;

	if(config.geocodeWeather) {
		snekfetch.get(geocodeApi, {
			query: {
				address: queryLocation,
				key: geocodeKey,
			},
		}).then(geocodeResponse => {
			if(geocodeResponse.body.status == 'ZERO_RESULTS') return;
			const location = geocodeResponse.body.results[0].geometry.location;
			const address = geocodeResponse.body.results[0].formatted_address;

			snekfetch.get(weatherApi, {
				query: {
					appid: weatherKey,
					lat: location.lat,
					lon: location.lng,
				},
			}).then(weatherResponse => {
				message.channel.send(processWeatherResponse(weatherResponse, address));
			}).catch(console.log);
		}).catch(console.log);
	}
	else {
		snekfetch.get(weatherApi, {
			query: {
				appid: weatherKey,
				q: queryLocation,
			},
		}).then(weatherResponse => {
			message.channel.send(processWeatherResponse(weatherResponse));
		}).catch(console.log);
	}
};

const processWeatherResponse = (response, address) => {
	let condition = response.body.weather[0].description;
	condition = condition.charAt(0).toUpperCase() + condition.slice(1);
	const conditionIcon = response.body.weather[0].icon;
	const temperature = response.body.main.temp;
	// temperatures are returned in kelvin, we need to convert first
	const tempF = (9 / 5 * (temperature - 273) + 32).toFixed(1);
	const tempC = (temperature - 273).toFixed(1);
	const pressure = response.body.main.pressure;
	const humidity = response.body.main.humidity;
	const windSpeed = response.body.wind.speed;
	const windSpeedMiles = (windSpeed * 2.2369).toFixed(1);
	const windSpeedKm = (windSpeed * 3.6).toFixed(1);
	if(!address) {
		address = response.body.name + ', ' + response.body.sys.country;
	}

	const weatherEmbed = new discord.RichEmbed();
	weatherEmbed.setTitle(' ');
	weatherEmbed.setDescription('\n');
	weatherEmbed.setAuthor(`${condition} in ${address}`, `http://openweathermap.org/img/w/${conditionIcon}.png`);
	weatherEmbed.setColor('0x00AE86');
	weatherEmbed.setURL(' ');
	weatherEmbed.addField('**Temperature**', `${tempC} °C\n${tempF} °F`, true);
	weatherEmbed.addField('**Wind**', `${windSpeedKm} km/h\n${windSpeedMiles} mph`, true);
	weatherEmbed.addField('**Pressure / Humidity**', `${pressure} hPa / ${humidity}%`, true);

	return weatherEmbed;
};


module.exports = {
	name: 'Weather',
	commands: [
		{
			execute: weather,
			triggers: ['!we', '!weather'],
		},
	],
};