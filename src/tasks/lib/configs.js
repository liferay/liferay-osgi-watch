'use strict';

const fs = require('fs');
const log = require('./log');
const path = require('path');

// Load base config
let configs = require('../../config/base.json');

// Override with per-user config
const userConfigsPath = path.resolve(require('os').homedir(), '.lwatch.json');
if (fs.existsSync(userConfigsPath)) {
	configs = Object.assign(configs, require(userConfigsPath));
}

// Override with per-project-type config
if (fs.existsSync(path.join(process.cwd(), 'build.xml'))) {
	configs = Object.assign(configs, require('../../config/ant.json'));
} else if (fs.existsSync(path.join(process.cwd(), 'build.gradle'))) {
	configs = Object.assign(configs, require('../../config/gradle.json'));
}

// Override with per-project config
const projectConfigsPath = path.join(process.cwd(), '.lwatch.json');
if (fs.existsSync(projectConfigsPath)) {
	try {
		configs = Object.assign(configs, require(projectConfigsPath));
	} catch (err) {
		log.warn(
			'config',
			`Invalid .lwatch.json file found in project (it won't be loaded)`,
		);
	}
}

// Tell user about final resolved config
log.info('config', configs);
module.exports = configs;
