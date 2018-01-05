'use strict';

const browserSync = require('browser-sync').create('liferay-osgi-watch');
const gulp = require('gulp');
const portfinder = require('portfinder');

gulp.task('browser-sync', function() {
  return portfinder.getPortPromise().then(port => {
    browserSync.init({
      rewriteRules: [
        {
          match: /8080/g,
          replace: port,
        },
      ],
      proxy: {
        target: 'localhost:8080',
        ws: true,
      },
      open: true,
      port: port,
      ui: false,
      reloadDelay: 500,
      reloadOnRestart: true,
    });
  });
});
