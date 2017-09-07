'use strict';

const bnd = require('./bnd');
const configs = require('./configs');
const fs = require('fs');
const gradle = require('./gradle');
const path = require('path');

const makeSoyDepGlob = dependency =>
	path.join('build', dependency, 'META-INF/resources', '**/*.soy');

const parseGradleDependencyOutput = dependency => {
	return new Promise(resolve => {
		const cleanLine = dependency.replace('\\--- ', '');

		if (cleanLine.startsWith('project')) {
			const relativeFormat = cleanLine.replace('project ', '');
			const parts = relativeFormat.substr(1).split(':');
			const relativeDir = path.relative(parts.join('/'), process.cwd());
			const projectDir = path.resolve(
				path.join(relativeDir, parts.join('/')),
			);

			bnd.getSymbolicName(projectDir).then(symbolicName => {
				resolve(makeSoyDepGlob(symbolicName));
			});
		} else {
			resolve(cleanLine.split(':')[1]);
		}
	});
};

module.exports = () => {
	return new Promise((resolve, reject) => {
		if (global.soyDeps) {
			resolve(global.soyDeps);
		} else if (fs.existsSync('build.gradle')) {
			gradle(['dependencies', '--configuration', 'soyCompile']).then(
				gradleOutput => {
					let soyDeps = Object.keys(configs.soyCompile || []).map(
						makeSoyDepGlob,
					);
					soyDeps = soyDeps.concat(
						gradleOutput
							.split('\n')
							.filter(line => line.indexOf('\\--- ') === 0)
							.map(depLine =>
								parseGradleDependencyOutput(depLine),
							),
					);
					Promise.all(soyDeps).then(dependencies => {
						dependencies.push(
							'node_modules/lexicon*/src/**/*.soy',
							'node_modules/metal*/src/**/*.soy',
						);
						global.soyDeps = dependencies;
						resolve(dependencies);
					});
				},
				error => {
					reject(
						new Error(
							'Unable to call gradle to get soy dependencies.',
						),
					);
				},
			);
		} else {
			resolve([]);
		}
	});
};
