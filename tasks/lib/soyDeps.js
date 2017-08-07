'use strict';

const configs = require('./configs');
const gradle = require('./gradle');
const path = require('path');

module.exports = () => {
	return new Promise((resolve, reject) => {
		if (global.soyDeps) {
			resolve(global.soyDeps);
		}
		else {
			gradle(['dependencies', '--configuration', 'soyCompile']).then(
				(gradleOutput) => {
					const makeSoyDepGlob = dep => path.join('build', dep, 'META-INF/resources', '**/*.soy');
					let soyDeps = Object.keys(configs.soyCompile || []).map(makeSoyDepGlob);
					soyDeps = soyDeps.concat(
						gradleOutput.split('\n')
						.filter(line => line.indexOf('\\--- ') === 0)
						.map(depLine => depLine.replace('\\--- ', '').split(':')[1])
						.map(makeSoyDepGlob)
						.filter(dep => soyDeps.indexOf(dep) === -1)
					);
					soyDeps.push(
						'node_modules/lexicon*/src/**/*.soy',
						'node_modules/metal*/src/**/*.soy'
					);
					global.soyDeps = soyDeps;
					resolve(soyDeps);
				},
				(error) => {
					reject(new Error('Unable to call gradle to get soy dependencies.'));
				}
			);
		}
	});
};