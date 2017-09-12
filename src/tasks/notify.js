'use strict';

const notify = require('../util/notify');
const gulp = require('gulp');

gulp.task('notify', done => {
	notify('Your changes are live. Reload the page.');
	done();
});
