'use strict';

const configs = require('../util/configs');
const gulp = require('gulp');
const log = require('../util/log');
const notify = require('../util/notify');
const runSequence = require('run-sequence');

gulp.task('watch', ['unjar'], function(done) {
	const start = process.hrtime();

	runSequence('build', 'install', () => {
		log.duration('startup', start);

		log.info('watch', `Listening for changes`);

		if (global.browserSync) {
			runSequence('browser-sync');
		}

		Object.keys(configs.builders).forEach(name => {
			const builder = configs.builders[name];

			gulp.task(`watch-${name}`, () => {
				let sequence = [];

				sequence.push(`build-${name}`);
				if (!builder.skipInstall) {
					sequence.push('install');
				}
				sequence.push('notify');

				runSequence(...sequence);
			});

			gulp.watch(builder.glob, [`watch-${name}`]);
		});

		notify('Ready! Waiting for changes.');

		done();
	});
});
