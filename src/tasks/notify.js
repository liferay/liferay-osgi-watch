'use strict';

const notify = require('../util/notify');
const gulp = require('gulp');
const browserSync = require('browser-sync');

gulp.task('notify', done => {
  if (global.browserSync) {
    browserSync.get('liferay-osgi-watch').reload();
  }
  notify('Your changes are live. Reload the page.');
  done();
});
