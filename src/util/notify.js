'use strict';

const configs = require('../util/configs');
const notifier = require('node-notifier');
const path = require('path');

/**
 * @param {string} message
 * @return {void}
 */
function notify(message) {
	if (!configs.notifications) {
		return false;
	}
	const config = Object.assign(
		{
			message: message,
		},
		{
			icon: path.resolve(__dirname, '../../icon.png'),
			title: 'liferay-osgi-watch',
			timeout: 8,
		},
	);
	notifier.notify(config);
}

module.exports = notify;
