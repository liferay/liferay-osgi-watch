'use strict';

const buildAmd = require('metal-tools-build-amd/lib/pipelines/buildAmd');
const cache = require('gulp-cached');
const compileSoy = require('metal-tools-soy/lib/pipelines/compileSoy');
const configs = require('../util/configs');
const glob = require('glob');
const gulp = require('gulp');
const log = require('../util/log');
const path = require('path');
const plumber = require('../util/plumber');
const replaceAmdDefine = require('../util/replaceAmdDefine');
const soyDeps = require('../util/soyDeps');

gulp.task('build-soy', done => {
  const start = process.hrtime();
  const cfg = configs.builders.soy;

  log.info('build-soy', 'Compiling soy files');

  // Only run it if there are files because soyDeps() can take a while since
  // it calls gradle.
  const files = glob.sync(cfg.glob);
  if (files.length === 0) {
    log.duration('build-soy', start);
    done();
    return;
  }

  soyDeps().then(soyDependencies => {
    gulp
      .src(cfg.glob)
      .pipe(plumber.plumb('build-soy'))
      .pipe(gulp.dest(path.join(configs.pathExploded, 'META-INF/resources')))
      .pipe(
        compileSoy({
          handleError: error => console.error(error),
          soyDeps: soyDependencies,
          src: cfg.glob,
        })
      )
      .pipe(cache('build-soy'))
      .pipe(gulp.dest(path.join(configs.pathExploded, 'META-INF/resources')))
      .pipe(
        buildAmd({
          base: path.join(configs.pathExploded, 'META-INF/resources'),
          cacheNamespace: 'transpile',
          moduleName: '',
        })
      )
      .pipe(replaceAmdDefine())
      .pipe(gulp.dest(path.join(configs.pathExploded, 'META-INF/resources')))
      .on('end', () => {
        log.duration('build-soy', start);
        done();
      });
  });
});
