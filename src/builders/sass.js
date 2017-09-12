'use strict';

const configs = require('../util/configs');
const fs = require('fs');
const gogo = require('../util/gogo');
const gulp = require('gulp');
const log = require('../util/log');
const path = require('path');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const unzip = require('gulp-unzip');

gulp.task('unzip-portal-common-css', [], done => {
	const start = process.hrtime();

	log.info('unzip-portal-common-css', 'Extracting portal common CSS');

	fs.stat('build/portal-common-css', (err, stats) => {
		if (stats && stats.isDirectory()) {
			done();
			return;
		}

		gogo.getLiferayHome().then(liferayHome => {
			gulp
				.src(
					path.join(
						liferayHome,
						'osgi/modules',
						'com.liferay.frontend.css.common.jar',
					),
				)
				.pipe(
					unzip({
						filter: entry => {
							return (
								entry.path.indexOf('META-INF/resources/') == 0
							);
						},
					}),
				)
				.pipe(
					rename(entry => {
						entry.dirname = entry.dirname.substring(
							'META-INF/resources/'.length,
						);
					}),
				)
				.pipe(gulp.dest('build/portal-common-css'))
				.on('end', () => {
					log.duration('unzip-portal-common-css', start);
					done();
				});
		});
	});
});

gulp.task('build-sass', ['unzip-portal-common-css'], done => {
	const start = process.hrtime();
	const cfg = configs.builders.sass;
	const destination = path.join(configs.pathExploded, cfg.outputDir || '');

	log.info('build-sass', 'Building CSS files');

	return gulp
		.src(cfg.glob)
		.pipe(
			sass({
				includePaths: ['build/portal-common-css'],
			}),
		)
		.pipe(gulp.dest(destination))
		.on('end', () => log.duration('build-sass', start));
});
