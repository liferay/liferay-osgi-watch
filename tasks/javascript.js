'use strict';

const buildAmd = require('metal-tools-build-amd/lib/pipelines/buildAmd');
const cache = require('gulp-cached');
const configs = require('./lib/configs');
const duration = require('gulp-duration');
const fs = require('fs');
const gulp = require('gulp');
const gutil = require('gulp-util');
const path = require('path');
const replaceAmdDefine = require('./lib/replaceAmdDefine');
const tap = require('gulp-tap');
const filter = require('gulp-filter');

gulp.task('build-javascript-es6', (done) => {
	gutil.log(gutil.colors.magenta('javascript-es6'), 'Transpiling files. This may take a while.');
	return gulp.src([configs.globEs6])
	.pipe(cache('build-javascript'))
	.pipe(gulp.dest(path.join(configs.pathExploded, 'META-INF/resources')))
	.pipe(filter(['**/*.js', '!**/*.soy.js']))
	.pipe(buildAmd({
		cacheNamespace: 'transpile',
		moduleName: ''
	}))
	.pipe(tap((file) => {
		file.path = file.path.replace(path.join(configs.pathExploded, 'META-INF/resources'), '');
	}))
	.pipe(replaceAmdDefine())
	.pipe(gulp.dest(path.join(configs.pathExploded, 'META-INF/resources')))
	.pipe(duration('javascript-es6'));
});

gulp.task('build-javascript', (done) => {
	let globDestination = (configs.globJs.indexOf('META-INF/resources') != -1) ? path.join(configs.pathExploded, 'META-INF/resources') : configs.pathExploded;

	gutil.log(gutil.colors.magenta('javascript-es5'), 'Copying ES5 files.');
	return gulp.src([configs.globJs, '!' + configs.globEs6])
	.pipe(gulp.dest(globDestination))
	.pipe(duration('javascript-es5'));
});