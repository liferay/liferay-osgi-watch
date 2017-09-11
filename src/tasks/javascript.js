'use strict';

const configs = require('./lib/configs');
const gulp = require('gulp');
const log = require('./lib/log');
const path = require('path');

gulp.task('build-javascript', done => {
	const start = process.hrtime();
	const globDestination =
		configs.globJs.indexOf('META-INF/resources') != -1
			? path.join(configs.pathExploded, 'META-INF/resources')
			: configs.pathExploded;

	log.info('build-javascript', 'Copying ES5 files');

	return gulp
		.src([configs.globJs, '!' + configs.globEs6])
		.pipe(gulp.dest(globDestination))
		.on('end', () => log.duration('build-javascript', start));
});
