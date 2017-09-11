'use strict';

const GogoShell = require('gogo-shell');
const configs = require('./configs');

module.exports = {
	getBundleId: symbolicName => {
		const gogoShell = new GogoShell();
		const command =
			'each [($.context bundles)] { if { ($it symbolicName) equals "' +
			symbolicName +
			'" } { $it bundleId } { "" } }';
		return gogoShell
			.connect({ port: configs.gogoPort })
			.then(() => gogoShell.sendCommand(command))
			.then(data => {
				gogoShell.end();
				const info = data
					.split('\n')
					.map(line => line.trim())
					.filter(line => !isNaN(parseFloat(line)) && isFinite(line));
				if (info.length === 0) {
					throw new Error(
						`Could not find installed bundle ${symbolicName} ` +
							'(you must first install it before running lwatch)',
					);
				}
				return info[0];
			});
	},

	getLiferayHome: () => {
		const gogoShell = new GogoShell();
		const command = 'equinox:props';
		return gogoShell
			.connect({ port: configs.gogoPort })
			.then(() => gogoShell.sendCommand(command))
			.then(data => {
				gogoShell.end();
				const info = data
					.split('\n')
					.filter(line => line.indexOf('liferay.home') > -1)
					.map(line => line.trim());
				if (info.length === 0) {
					throw new Error('Could not find liferay.home.');
				}
				return info[0]
					.split('=')
					.pop()
					.trim();
			});
	},

	install: (bundleId, dir) => {
		const gogoShell = new GogoShell();
		const command = ['update ', bundleId, ' reference:file://', dir].join(
			'',
		);
		return gogoShell
			.connect({ port: configs.gogoPort })
			.then(() => gogoShell.sendCommand(command))
			.then(data => gogoShell.end());
	},
};
