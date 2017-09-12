'use strict';

const fs = require('fs');
const log = require('./log');
const path = require('path');

/**
 * @return {object} parsed JSON config
 */
function loadProjectConfig() {
	const projectConfigPath = path.join(process.cwd(), '.lwatch.json');
	let projectConfig = {};

	try {
		projectConfig = require(projectConfigPath);
	} catch (err) {
		log.warn(
			'config',
			`Invalid .lwatch.json file found in project (it won't be loaded)`,
		);
	}

	return projectConfig;
}

/**
 * @param {object} config parsed JSON config
 * @return {object} normalized JSON config
 */
function normalizeConfig(config) {
	Object.keys(config.builders).forEach(name => {
		const builder = config.builders[name];

		if (builder.config === undefined) {
			builder.config = {};
		}
	});

	return config;
}

// Load project config
const projectConfig = loadProjectConfig();

// Guess project type if not given in config
if (!projectConfig.projectType) {
	if (fs.existsSync(path.join(process.cwd(), 'build.xml'))) {
		projectConfig.projectType = 'war';
	} else if (fs.existsSync(path.join(process.cwd(), 'build.gradle'))) {
		projectConfig.projectType = 'osgi';
	}
}

// Tell user about project type
log.info('config', `Project type set to: ${projectConfig.projectType}`);

// Load base config
let configs = require('../config/base.json');

// Override with per-user config
const userConfigsPath = path.resolve(require('os').homedir(), '.lwatch.json');
if (fs.existsSync(userConfigsPath)) {
	configs = Object.assign(configs, require(userConfigsPath));
}

// Override with per-project-type config
configs = Object.assign(
	configs,
	require(`../config/${projectConfig.projectType}.json`),
);

// Override with per-project config
configs = Object.assign(configs, projectConfig);

// Normalize config
configs = normalizeConfig(configs);

// Tell user about final resolved config
log.info('config', `Resolved config:\n${JSON.stringify(configs, null, 2)}`);
module.exports = configs;
