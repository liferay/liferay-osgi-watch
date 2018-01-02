'use strict';

const buildAmd = require('metal-tools-build-amd/lib/pipelines/buildAmd');
const cache = require('gulp-cached');
const configs = require('../util/configs');
const filter = require('gulp-filter');
const gulp = require('gulp');
const jsDeps = require('../util/jsDeps');
const log = require('../util/log');
const path = require('path');
const replaceAmdDefine = require('../util/replaceAmdDefine');

gulp.task('build-javascript-es6', ['build-soy'], done => {
  const start = process.hrtime();
  const cfg = configs.builders['javascript-es6'];

  log.info('build-javascript-es6', 'Transpiling ES6 files');

  return jsDeps().then(jsDependencies => {
    return gulp
      .src(cfg.glob)
      .pipe(cache('build-javascript'))
      .pipe(gulp.dest(path.join(configs.pathExploded, 'META-INF/resources')))
      .pipe(filter(['**/*.js']))
      .pipe(
        buildAmd({
          base: path.join(configs.pathExploded, 'META-INF/resources'),
          cacheNamespace: 'transpile',
          moduleName: '',
        })
      )
      .pipe(replaceAmdDefine())
      .pipe(gulp.dest(path.join(configs.pathExploded, 'META-INF/resources')))
      .on('end', () => log.duration('build-javascript-es6', start));
  });
});
