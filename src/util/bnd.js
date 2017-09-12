'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * @param {String} dir
 * @return {String}
 */
export function getJarName(dir) {
	return getSymbolicName(dir).then(
		symbolicName =>
			symbolicName + (fs.existsSync('build.gradle') ? '.jar' : '.war'),
	);
}

/**
 * @param {String} dir
 * @return {String}
 */
export function getBundleVersion(dir) {
	return getProperty(
		dir,
		'Bundle-Version',
		data => data['version'],
		(
			buildPropertiesFile,
			pluginPackageFile,
			resolve,
			reject,
			defaultValue,
		) => {
			getJavaProperty(
				buildPropertiesFile,
				'lp.version',
				buildVersion => {
					getJavaProperty(
						pluginPackageFile,
						'module-incremental-version',
						incrementVersion =>
							resolve(buildVersion + '.' + incrementVersion),
						err => resolve(defaultValue),
						defaultValue,
					);
				},
				err => resolve(defaultValue),
				defaultValue,
			);
		},
		'0',
	);
}

/**
 * @param {String} dir
 * @return {String}
 */
export function getSymbolicName(dir) {
	return getProperty(
		dir,
		'Bundle-SymbolicName',
		data => data['liferayTheme']['distName'],
		(
			buildPropertiesFile,
			pluginPackageFile,
			resolve,
			reject,
			defaultValue,
		) => {
			resolve(path.basename(process.cwd()));
		},
		path.basename(process.cwd()),
	);
}

/**
 * @param {String} dir
 * @param {String} property
 * @param {function} getPackageJSONValue
 * @param {function} getPluginPackageValue
 * @param {String} defaultValue
 * @return {String}
 */
export function getProperty(
	dir,
	property,
	getPackageJSONValue,
	getPluginPackageValue,
	defaultValue,
) {
	return new Promise((resolve, reject) => {
		const bndFile = path.join(dir, 'bnd.bnd');
		const buildPropertiesFile = path.join(dir, '../../build.properties');
		const packageFile = path.join(dir, 'package.json');
		const pluginPackageFile = path.join(
			dir,
			'docroot/WEB-INF/liferay-plugin-package.properties',
		);
		const themeFile = path.join(dir, 'liferay-theme.json');

		if (fs.existsSync(bndFile)) {
			getBndProperty(bndFile, property, resolve, reject, defaultValue);
		} else if (fs.existsSync(themeFile) && fs.existsSync(packageFile)) {
			getPackageJSONProperty(
				packageFile,
				getPackageJSONValue,
				resolve,
				reject,
				defaultValue,
			);
		} else if (
			fs.existsSync(buildPropertiesFile) &&
			fs.existsSync(pluginPackageFile)
		) {
			getPluginPackageValue(
				buildPropertiesFile,
				pluginPackageFile,
				resolve,
				reject,
				defaultValue,
			);
		} else {
			resolve(defaultValue);
		}
	});
}

/**
 * @param {String} bndFile
 * @param {String} property
 * @param {function} resolve
 * @param {function} reject
 * @param {String} defaultValue
 */
export function getBndProperty(
	bndFile,
	property,
	resolve,
	reject,
	defaultValue,
) {
	try {
		const reader = readline.createInterface({
			input: fs.createReadStream(bndFile),
		});

		let foundName = false;

		reader.on('line', function(line) {
			if (line.indexOf(property) === 0) {
				const parts = line.split(':');

				foundName = true;

				resolve(parts[1].trim());
			}
		});

		reader.on('close', function() {
			if (!foundName) {
				resolve(defaultValue);
			}
		});
	} catch (e) {
		reject(Error('Could not open ' + bndFile));
	}
}

/**
 * @param {String} propertyFile
 * @param {String} property
 * @param {function} resolve
 * @param {function} reject
 * @param {String} defaultValue
 */
export function getJavaProperty(
	propertyFile,
	property,
	resolve,
	reject,
	defaultValue,
) {
	try {
		const reader = readline.createInterface({
			input: fs.createReadStream(propertyFile),
		});

		let foundName = false;

		reader.on('line', function(line) {
			line = line.trim();

			if (line.indexOf(property) === 0) {
				const parts = line.split('=');

				foundName = true;

				resolve(parts[1].trim());
			}
		});

		reader.on('close', function() {
			if (!foundName) {
				resolve(defaultValue);
			}
		});
	} catch (e) {
		reject(Error('Could not open ' + propertyFile));
	}
}

/**
 * @param {String} packageFile
 * @param {function} getPackageJSONValue
 * @param {function} resolve
 * @param {function} reject
 * @param {String} defaultValue
 */
export function getPackageJSONProperty(
	packageFile,
	getPackageJSONValue,
	resolve,
	reject,
	defaultValue,
) {
	try {
		fs.readFile(packageFile, (err, jsonText) => {
			resolve(getPackageJSONValue(JSON.parse(jsonText)));
		});
	} catch (e) {
		resolve(defaultValue);
	}
}
