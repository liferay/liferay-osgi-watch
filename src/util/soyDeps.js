'use strict';

const bnd = require('./bnd');
const fs = require('fs');
const gradle = require('./gradle');
const path = require('path');

const makeSoyDepGlob = dependency =>
  path.join('build', dependency, 'META-INF/resources', '**/*.soy');

const parseGradleDependencyOutput = dependency => {
  return new Promise(resolve => {
    const parts = dependency.substr(1).split(':');
    const relativeDir = path.relative(parts.join('/'), process.cwd());
    const projectDir = path.resolve(path.join(relativeDir, parts.join('/')));

    bnd.getSymbolicName(projectDir).then(symbolicName => {
      resolve(makeSoyDepGlob(symbolicName));
    });
  });
};

module.exports = () => {
  return new Promise((resolve, reject) => {
    if (global.soyDeps) {
      resolve(global.soyDeps);
    } else {
      fs.stat('build.gradle', error => {
        if (error) {
          resolve([]);
        } else {
          let jsDeps = gradle
            .dependencies('jsCompile')
            .map(depLine => parseGradleDependencyOutput(depLine));
          Promise.all(jsDeps)
            .then(dependencies => {
              dependencies.push(
                'node_modules/lexicon*/src/**/*.soy',
                'node_modules/metal*/src/**/*.soy'
              );
              global.soyDeps = dependencies;
              resolve(dependencies);
            })
            .catch(reject);
        }
      });
    }
  });
};
