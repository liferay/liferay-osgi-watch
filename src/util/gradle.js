'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const getGradleChildProcess = args => {
	const cwd = process.cwd();

	const gradlePath = getGradlePath();

	const gradleSettingsFilePath = path.join(cwd, '..', 'settings.gradle');

	if (!fs.existsSync(gradleSettingsFilePath)) {
		return childProcess.spawn(gradlePath, args, { cwd });
	}

	const gradleSettingsTempFilePath = gradleSettingsFilePath + '.tmp';

	fs.renameSync(gradleSettingsFilePath, gradleSettingsTempFilePath);

	const cp = childProcess.spawn(gradlePath, args, { cwd });

	cp.on('exit', () =>
		fs.renameSync(gradleSettingsTempFilePath, gradleSettingsFilePath),
	);

	return cp;
};

const getGradlePath = () => {
	if (global.gradlePath) {
		return global.gradlePath;
	}

	let gradleWrapperFolder = process.cwd();
	let gradlePath = path.join(gradleWrapperFolder, 'gradlew');

	while (
		gradleWrapperFolder &&
		gradleWrapperFolder != '/' &&
		!fs.existsSync(gradlePath)
	) {
		gradleWrapperFolder = path.dirname(gradleWrapperFolder);
		gradlePath = path.join(gradleWrapperFolder, 'gradlew');
	}

	global.gradlePath = fs.existsSync(gradlePath) ? gradlePath : 'gradle';

	return global.gradlePath;
};

module.exports = args => {
	return new Promise((resolve, reject) => {
		const cp = getGradleChildProcess(args);
		let gradleOutput = '';
		cp.stdout.on('data', data => {
			gradleOutput += data.toString();
		});
		cp.stderr.pipe(process.stderr);
		cp.on('exit', code => {
			if (code === 0) {
				resolve(gradleOutput);
			} else {
				reject(
					new Error(
						'Unable to call ' +
							getGradlePath() +
							' ' +
							args.join(' '),
					),
				);
			}
		});
	});
};
