'use strict';

const browserSync = require('browser-sync');
const config = require('./lib/configs');
const gulp = require('gulp');
const log = require('./lib/log');
const path = require('path');

gulp.task('build-jsp', [], function(done) {
	const start = process.hrtime();

	log.info('build-jsp', 'Copying JSP files');

	gulp
		.src(config.globJsp)
		.pipe(gulp.dest(path.join(config.pathExploded, 'META-INF/resources')))
		.on('end', () => {
			if (global.browserSync) {
				browserSync.get('liferay-osgi-watch').reload();
			}
			log.duration('build-jsp', start);
			done();
		});
});
