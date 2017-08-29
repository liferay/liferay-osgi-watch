'use strict';

const browserSync = require('browser-sync').create('liferay-osgi-watch');
const configs = require('./lib/configs');
const fs = require('fs');
const gulp = require('gulp');
const gutil = require('gulp-util');
const notifier = require('node-notifier');
const path = require('path');
const pretty = require('pretty-hrtime');
const runSequence = require('run-sequence');

gulp.task('build', (done) => {
	let promises = [];

	if (fs.existsSync('build.gradle')) {
		promises = [
			new Promise((resolve) => runSequence('build-java', resolve)),
			new Promise((resolve) => runSequence('build-javascript', resolve)),
			new Promise((resolve) => runSequence('build-javascript-es6', resolve)),
			new Promise((resolve) => runSequence('build-jsp', resolve)),
			new Promise((resolve) => runSequence('build-sass', resolve)),
			new Promise((resolve) => runSequence('build-soy', resolve))
		];
	}
	else if (fs.exists('build.xml')) {
		promises = [
			new Promise((resolve) => runSequence('build-java', resolve)),
			new Promise((resolve) => runSequence('build-javascript', resolve)),
			new Promise((resolve) => runSequence('build-jsp', resolve)),
			new Promise((resolve) => runSequence('build-sass', resolve))
		];
	}

	Promise.all(promises).then(() => done());
});

const notify = (message) => {
	if (!configs.notifications) {
		return false;
	}
	const config = Object.assign({
		message: message
	}, {
		icon: path.resolve(__dirname, '../icon.png'),
		title: 'liferay-osgi-watch',
		timeout: 8
	});
	notifier.notify(config);
};

gulp.task('notify', (done) => {
	notify('Your changes are live. Reload the page.');
	done();
});

gulp.task('watch', ['unjar'], function(done) {
	const timeStart  = process.hrtime();
	runSequence(
		'build',
		'install',
		() => {
			const duration = pretty(process.hrtime(timeStart));
			const gulpPrefix = '[' + gutil.colors.green('gulp') + ']';
			console.log(gulpPrefix + ' startup took:', gutil.colors.magenta(duration));
			gutil.log(gutil.colors.magenta('watch'), 'Listening for changes');
			if (global.browserSync) {
				runSequence('browser-sync');
			}
			// Java
			gulp.task('watch-java', () => runSequence('build-java', 'install', 'notify'));
			gulp.watch(configs.globJava, ['watch-java']);
			if (fs.existsSync('build.gradle')) {
				// JavaScript. For ES5 files, we only need to call build-javascript and copy them over.
				gulp.task('watch-javascript', () => runSequence('build-javascript', 'notify'));
				gulp.watch([configs.globJs, '!' + configs.globEs6], ['watch-javascript']);
				// JavaScript. For ES5 files, we need to call build-javascript-es6 so that they get transpiled.
				gulp.task('watch-javascript-es6', () => runSequence('build-javascript-es6', 'notify'));
				gulp.watch(configs.globEs6, ['watch-javascript-es6']);
			}
			else {
				gulp.task('watch-javascript', () => runSequence('build-javascript', 'install', 'notify'));
				gulp.watch([configs.globJs, '!' + configs.globEs6], ['watch-javascript']);
			}
			// JSP
			gulp.task('watch-jsp', () => runSequence('build-jsp', 'install', 'notify'));
			gulp.watch(configs.globJsp, ['watch-jsp']);
			// SASS
			if (fs.existsSync('build.gradle')) {
				gulp.task('watch-sass', () => runSequence('build-sass', 'notify'));
				gulp.watch(configs.globSass, ['watch-sass']);
			}
			else {
				gulp.task('watch-sass', () => runSequence('build-sass', 'install', 'notify'));
				gulp.watch(configs.globSass, ['watch-sass']);
			}
			// Soy
			if (fs.existsSync('build.gradle')) {
				gulp.task('watch-soy', () => runSequence('build-soy', 'notify'));
				gulp.watch(configs.globSoy, ['watch-soy']);
			}
			notify('Ready! Waiting for changes.');
			done();
		}
	);
});

gulp.task('browser-sync', function() {
	browserSync.init({
		files: [{
			match: path.join(configs.pathExploded, '**/*.*'),
			options: {
				ignored: '**/*.jsp'
			}
		}],
		rewriteRules: [
			{
				match: /8080/g,
				replace: '8081'
			}
		],
		proxy: {
			target: 'localhost:8080',
			ws: true
		},
		open: false,
		port: 8081,
		ui: false,
		reloadDelay: 500,
		reloadOnRestart: true
	});
});