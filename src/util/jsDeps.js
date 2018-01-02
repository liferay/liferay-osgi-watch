'use strict';

const bnd = require('./bnd');
const fs = require('fs');
const gradle = require('./gradle');
const log = require('./log');
const path = require('path');
const ncp = require('ncp').ncp;

const copyJsDependency = dependency => {
  return new Promise((resolve, reject) => {
    const cleanLine = dependency.replace('\\--- ', '');

    if (cleanLine.startsWith('project')) {
      const relativeFormat = cleanLine.replace('project ', '');
      const parts = relativeFormat.substr(1).split(':');
      const relativeDir = path.relative(parts.join('/'), process.cwd());
      const projectDir = path.resolve(path.join(relativeDir, parts.join('/')));
      Promise.all([
        bnd.getSymbolicName(projectDir),
        bnd.getWebContextPath(projectDir),
      ]).then(info => {
        const sourceName = `${projectDir}/src/main/resources/META-INF/resources`;
        const targetName = 'node_modules' + info[1];
        ncp(sourceName, targetName, error => {
          if (error) {
            reject(error);
          } else {
            resolve(targetName);
          }
        });
      });
    } else {
      resolve(cleanLine.split(':')[1]);
    }
  });
};

module.exports = () => {
  return new Promise((resolve, reject) => {
    if (global.jsDeps) {
      resolve(global.jsDeps);
    } else if (fs.existsSync('build.gradle')) {
      gradle(['dependencies', '--configuration', 'jsCompile']).then(
        gradleOutput => {
          let jsDeps = gradleOutput
            .split('\n')
            .filter(line => line.indexOf('\\--- ') === 0)
            .map(depLine => copyJsDependency(depLine));
          Promise.all(jsDeps).then(dependencies => {
            global.jsDeps = dependencies;
            resolve(dependencies);
          });
        },
        error => {
          log.warn(
            'jsDeps',
            'Unable to get jsCompile dependencies from gradle. ' +
              'Trying to continue without it...'
          );
          resolve([]);
        }
      );
    } else {
      resolve([]);
    }
  });
};
