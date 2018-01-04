'use strict';

const browserSync = require('browser-sync').create('liferay-osgi-watch');
const gulp = require('gulp');

gulp.task('browser-sync', function() {
  browserSync.init({
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
