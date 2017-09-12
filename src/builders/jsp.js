'use strict';

const browserSync = require('browser-sync');
const configs = require('../util/configs');
const gulp = require('gulp');
const log = require('../util/log');
const path = require('path');

gulp.task('build-jsp', [], function(done) {
	const start = process.hrtime();
	const cfg = configs.builders.jsp;

	log.info('build-jsp', 'Copying JSP files');

	gulp
		.src(cfg.glob)
		.pipe(gulp.dest(path.join(configs.pathExploded, 'META-INF/resources')))
		.on('end', () => {
			if (global.browserSync) {
				browserSync.get('liferay-osgi-watch').reload();
			}
			log.duration('build-jsp', start);
			done();
		});
});
