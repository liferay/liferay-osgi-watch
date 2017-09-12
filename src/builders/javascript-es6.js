'use strict';

const buildAmd = require('metal-tools-build-amd/lib/pipelines/buildAmd');
const cache = require('gulp-cached');
const configs = require('../util/configs');
const gulp = require('gulp');
const log = require('../util/log');
const path = require('path');
const replaceAmdDefine = require('../util/replaceAmdDefine');
const tap = require('gulp-tap');
const filter = require('gulp-filter');

gulp.task('build-javascript-es6', done => {
	const start = process.hrtime();
	const cfg = configs.builders['javascript-es6'];

	log.info('build-javascript-es6', 'Transpiling ES6 files');

	return gulp
		.src(cfg.glob)
		.pipe(cache('build-javascript'))
		.pipe(gulp.dest(path.join(configs.pathExploded, 'META-INF/resources')))
		.pipe(filter(['**/*.js', '!**/*.soy.js']))
		.pipe(
			buildAmd({
				cacheNamespace: 'transpile',
				moduleName: '',
			}),
		)
		.pipe(
			tap(file => {
				file.path = file.path.replace(
					path.join(configs.pathExploded, 'META-INF/resources'),
					'',
				);
			}),
		)
		.pipe(replaceAmdDefine())
		.pipe(gulp.dest(path.join(configs.pathExploded, 'META-INF/resources')))
		.on('end', () => log.duration('build-java', start));
});
