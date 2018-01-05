'use strict';

const configs = require('../util/configs');
const gulp = require('gulp');
const log = require('../util/log');
const runSequence = require('run-sequence');

gulp.task('build', done => {
  const start = process.hrtime();

  log.info('build', 'Building entire project');

  const promises = Object.keys(configs.builders)
    .filter(name => configs.skip.indexOf(name) === -1)
    .map(name => new Promise(resolve => runSequence(`build-${name}`, resolve)));

  Promise.all(promises).then(() => {
    log.duration('build', start);
    done();
  });
});
