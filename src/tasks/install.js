'use strict';

const bnd = require('../util/bnd');
const configs = require('../util/configs');
const gogo = require('../util/gogo');
const gulp = require('gulp');
const log = require('../util/log');
const path = require('path');

gulp.task('install', [], () => {
	const start = process.hrtime();
	const explodedDir = path.resolve(configs.pathExploded);

	log.info('install', 'Updating OSGi bundle');

	return bnd
		.getSymbolicName(process.cwd())
		.then(symbolicName => gogo.getBundleId(symbolicName))
		.then(bundleId => gogo.install(bundleId, explodedDir))
		.then(() => {
			log.duration('install', start);
			return true;
		})
		.catch(error => log.error('install', error));
});
