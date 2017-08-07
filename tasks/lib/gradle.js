'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const getGradlePath = () => {
	if (global.gradlePath) {
		return global.gradlePath;
	}

	let gradleWrapperFolder = process.cwd();
	let gradlePath = path.join(gradleWrapperFolder, 'gradlew');

	while (gradleWrapperFolder && (gradleWrapperFolder != '/') && !fs.existsSync(gradlePath)) {
		gradleWrapperFolder = path.dirname(gradleWrapperFolder);
		gradlePath = path.join(gradleWrapperFolder, 'gradlew');
	}

	global.gradlePath = fs.existsSync(gradlePath) ? gradlePath : 'gradle';

	return global.gradlePath;
};

module.exports = (args) => {
	return new Promise((resolve, reject) => {
		const gradlePath = getGradlePath();

		const cp = childProcess.spawn(gradlePath, args, { cwd: process.cwd() });
		let gradleOutput = '';
		cp.stdout.on('data', (data) => {
			gradleOutput += data.toString();
		});
		cp.stderr.pipe(process.stderr);
		cp.on('exit', (code) => {
			if (code === 0) {
				resolve(gradleOutput);
			}
			else {
				reject(new Error('Unable to call ' + gradlePath + ' ' + args.join(' ')));
			}
		});
	});
};