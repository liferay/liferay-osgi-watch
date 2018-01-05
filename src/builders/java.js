'use strict';

const ant = require('../util/ant');
const configs = require('../util/configs');
const fs = require('fs');
const gradle = require('../util/gradle');
const gulp = require('gulp');
const log = require('../util/log');

const buildGradleArgs = () => {
  const skippedTasks = [
    'transpileJS',
    'configJSModules',
    'npmInstall',
    'downloadMetalCli',
    'buildCSS',
    'downloadNode',
    'jar',
  ];
  const args = ['compileJava'];
  skippedTasks.forEach(task => {
    args.push('-x');
    args.push(task);
  });
  return args;
};

gulp.task('build-java', done => {
  const start = process.hrtime();
  const cfg = configs.builders.java;

  log.info('build-java', 'Compiling Java classes');

  return new Promise((resolve, reject) => {
    fs.stat('build.gradle', error => {
      let compileResult;
      if (error) {
        compileResult = ant(['compile']);
      } else {
        compileResult = gradle(buildGradleArgs());
      }
      compileResult
        .then(
          compileOutput => {
            gulp
              .src(cfg.config.outputGlob)
              .pipe(gulp.dest(configs.pathExploded))
              .on('end', () => {
                log.duration('build-java', start);
                resolve();
              });
          },
          compileError => {
            log.error(
              'build-java',
              'Java classes could not be compiled (👆👆 check compiler output 👆👆)'
            );
            resolve();
          }
        )
        .catch(() => {
          log.error('build-java', 'error');
          reject('failed');
        });
    });
  });
});
