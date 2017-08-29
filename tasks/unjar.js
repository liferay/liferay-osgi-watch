'use strict';

const bnd = require('./lib/bnd');
const configs = require('./lib/configs');
const duration = require('gulp-duration');
const fs = require('fs');
const gogo = require('./lib/gogo');
const gulp = require('gulp');
const gutil = require('gulp-util');
const path = require('path');
const unzip = require('gulp-unzip');

gulp.task('unjar', (done) => {
	const unjarTimer = duration('unjar');
	gutil.log(gutil.colors.magenta('unjar'), 'Unpacking deployed bundle');
	const info = {};
	return bnd.getSymbolicName(process.cwd())
	.then((symbolicName) => {
		info.symbolicName = symbolicName;
		return gogo.getBundleId(symbolicName);
	})
	.then((bundleId) => {
		info.bundleId = bundleId;
		return bnd.getBundleVersion(process.cwd());
	})
	.then((bundleVersion) => {
		info.bundleVersion = bundleVersion;
		return bnd.getJarName(process.cwd());
	})
	.then((jarName) => {
		info.jarName = jarName;
		return gogo.getLiferayHome();
	})
	.then((liferayHome) => new Promise((resolve, reject) => {
		let extension = info.jarName.substring(info.jarName.length - 4);

		let stateFolder = path.join(liferayHome, 'osgi', 'state', 'org.eclipse.osgi', String(info.bundleId));
		let latestStateFolderItem = fs.readdirSync(stateFolder).map(parseInt).sort().map(String).pop();
		let jarPath = latestStateFolderItem ? path.join(stateFolder, latestStateFolderItem, 'bundleFile') : info.jarName;

		if (extension == '.jar') {
			if (!fs.existsSync(jarPath)) {
				jarPath = path.join(liferayHome, 'osgi/modules', info.jarName);
			}

			if (!fs.existsSync(jarPath)) {
				jarPath = path.join(liferayHome, 'osgi/portal', info.jarName);
			}

			if (!fs.existsSync(jarPath)) {
				jarPath = path.join(liferayHome, 'osgi/marketplace/override', info.jarName);
			}

			if (!fs.existsSync(jarPath)) {
				jarPath = path.join(process.cwd(), 'build/libs', info.symbolicName + '-' + info.bundleVersion + '.jar');
			}
		}

		if (!fs.existsSync(jarPath)) {
			if (fs.existsSync(configs.pathExploded)) {
				resolve();
			}
			else {
				reject(new Error('Unable to find installed bundle ' + info.symbolicName));
			}
		}
		else {
			gulp.src(jarPath)
			.pipe(unzip())
			.pipe(unjarTimer)
			.pipe(gulp.dest(path.resolve(configs.pathExploded)))
			.on('end', () => resolve());
		}
	}))
	.catch((error) => console.error(error));
});