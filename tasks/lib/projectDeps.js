'use strict';

const fs = require('fs');
const gradle = require('./gradle');

module.exports = () => {
	return new Promise((resolve, reject) => {
		if (global.projectDeps) {
			resolve(global.projectDeps);
		} else if (fs.exists('build.gradle')) {
			gradle(['dependencies', '--configuration', 'compile']).then(
				gradleOutput => {
					let projectDeps = gradleOutput
						.split('\n')
						.filter(line => line.indexOf('project :') > -1)
						.map(depLine =>
							depLine.replace(/(\+|\\)--- project /, '')
						);

					global.projectDeps = projectDeps;

					resolve(projectDeps);
				},
				error => {
					reject(
						new Error(
							'Unable to call gradle to get compile dependencies.'
						)
					);
				}
			);
		} else {
			resolve([]);
		}
	});
};