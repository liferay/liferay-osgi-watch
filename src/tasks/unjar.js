'use strict';

const bnd = require('../util/bnd');
const configs = require('../util/configs');
const fs = require('fs');
const gogo = require('../util/gogo');
const gulp = require('gulp');
const log = require('../util/log');
const path = require('path');
const unzip = require('gulp-unzip');

gulp.task('unjar', done => {
	const start = process.hrtime();
	const info = {};

	log.info('unjar', 'Unpacking deployed bundle');

	return bnd
		.getSymbolicName(process.cwd())
		.then(symbolicName => {
			info.symbolicName = symbolicName;
			return gogo.getBundleId(symbolicName);
		})
		.then(bundleId => {
			info.bundleId = bundleId;
			return bnd.getBundleVersion(process.cwd());
		})
		.then(bundleVersion => {
			info.bundleVersion = bundleVersion;
			return bnd.getJarName(process.cwd());
		})
		.then(jarName => {
			info.jarName = jarName;
			return gogo.getLiferayHome();
		})
		.then(
			liferayHome =>
				new Promise((resolve, reject) => {
					let extension = info.jarName.substring(
						info.jarName.length - 4,
					);

					let stateFolder = path.join(
						liferayHome,
						'osgi',
						'state',
						'org.eclipse.osgi',
						String(info.bundleId),
					);
					let latestStateFolderItem = fs
						.readdirSync(stateFolder)
						.map(parseInt)
						.sort()
						.map(String)
						.pop();
					let jarPath = latestStateFolderItem
						? path.join(
								stateFolder,
								latestStateFolderItem,
								'bundleFile',
							)
						: info.jarName;

					if (extension == '.jar') {
						if (!fs.existsSync(jarPath)) {
							jarPath = path.join(
								liferayHome,
								'osgi/modules',
								info.jarName,
							);
						}

						if (!fs.existsSync(jarPath)) {
							jarPath = path.join(
								liferayHome,
								'osgi/portal',
								info.jarName,
							);
						}

						if (!fs.existsSync(jarPath)) {
							jarPath = path.join(
								liferayHome,
								'osgi/marketplace/override',
								info.jarName,
							);
						}

						if (!fs.existsSync(jarPath)) {
							jarPath = path.join(
								process.cwd(),
								'build/libs',
								info.symbolicName +
									'-' +
									info.bundleVersion +
									'.jar',
							);
						}
					}

					if (!fs.existsSync(jarPath)) {
						if (fs.existsSync(configs.pathExploded)) {
							resolve();
						} else {
							reject(
								new Error(
									`Exploded directory path not found: ${info.symbolicName}`,
								),
							);
						}
					} else {
						gulp
							.src(jarPath)
							.pipe(unzip())
							.pipe(gulp.dest(path.resolve(configs.pathExploded)))
							.on('end', () => {
								log.duration('unjar', start);
								resolve();
							});
					}
				}),
		)
		.catch(error => log.error('unjar', error));
});
