'use strict';

const configs = require('./lib/configs');
const fs = require('fs');
const gogo = require('./lib/gogo');
const gulp = require('gulp');
const log = require('./lib/log');
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
	const globDestination =
		configs.globJs.indexOf('META-INF/resources') != -1
			? path.join(configs.pathExploded, 'META-INF/resources')
			: configs.pathExploded;

	log.info('build-sass', 'Building CSS files');

	return gulp
		.src(configs.globSass)
		.pipe(
			sass({
				includePaths: ['build/portal-common-css'],
			}),
		)
		.pipe(gulp.dest(globDestination))
		.on('end', () => log.duration('build-sass', start));
});
