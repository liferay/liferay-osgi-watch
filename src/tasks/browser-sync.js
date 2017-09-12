'use strict';

const browserSync = require('browser-sync').create('liferay-osgi-watch');
const configs = require('../util/configs');
const gulp = require('gulp');
const path = require('path');

gulp.task('browser-sync', function() {
	browserSync.init({
		files: [
			{
				match: path.join(configs.pathExploded, '**/*.*'),
				options: {
					ignored: '**/*.jsp',
				},
			},
		],
		rewriteRules: [
			{
				match: /8080/g,
				replace: '8081',
			},
		],
		proxy: {
			target: 'localhost:8080',
			ws: true,
		},
		open: false,
		port: 8081,
		ui: false,
		reloadDelay: 500,
		reloadOnRestart: true,
	});
});
