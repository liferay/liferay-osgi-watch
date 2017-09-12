'use strict';

const configs = require('../util/configs');
const gulp = require('gulp');
const log = require('../util/log');
const path = require('path');

gulp.task('build-javascript', done => {
	const start = process.hrtime();
	const cfg = configs.builders['javascript'];
	const destination = path.join(configs.pathExploded, cfg.outputDir || '');

	log.info('build-javascript', 'Copying Javascript files');

	return gulp
		.src(cfg.glob)
		.pipe(gulp.dest(destination))
		.on('end', () => log.duration('build-javascript', start));
});
