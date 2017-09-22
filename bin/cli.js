#!/usr/bin/env node

const gulp = require('gulp');

const yargs = require('yargs')
	.usage('Usage: lwatch [options]')
	.boolean('browser')
	.alias('b', 'browser')
	.describe('browser', 'Refreshes browser whenever a change is detected')
	.alias('v', 'version')
	.describe('version', 'Prints current version')
	.help('h')
	.epilog('Copyright 2016')
	.version(function() {
		return require('../package').version;
	});

if (yargs.argv.browser) {
	global.browserSync = true;
}

require('../lib/gulpfile');

gulp.start.apply(gulp, ['watch']);
