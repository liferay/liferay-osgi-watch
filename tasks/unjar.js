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
		return bnd.getBundleVersion(process.cwd());
	})
	.then((bundleVersion) => {
		info.bundleVersion = bundleVersion;
		return gogo.getLiferayHome();
	})
	.then((liferayHome) => new Promise((resolve, reject) => {
		let jarPath = path.join(liferayHome, 'osgi/modules', info.symbolicName + '.jar');

		if (!fs.existsSync(jarPath)) {
			jarPath = path.join(liferayHome, 'osgi/portal', info.symbolicName + '.jar');
		}

		if (!fs.existsSync(jarPath)) {
			jarPath = path.join(liferayHome, 'osgi/marketplace/override', info.symbolicName + '.jar');
		}

		if (!fs.existsSync(jarPath)) {
			jarPath = path.join(process.cwd(), 'build/libs', info.symbolicName + '-' + info.bundleVersion + '.jar');
		}

		if (!fs.existsSync(jarPath)) {
			reject(new Error('Unable to find installed bundle ' + info.symbolicName));
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