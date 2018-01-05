'use strict';

const bnd = require('./bnd');
const fs = require('fs-extra');
const gradle = require('./gradle');
const log = require('./log');
const path = require('path');

const copyJsDependency = dependency => {
  return new Promise((resolve, reject) => {
    const parts = dependency.substr(1).split(':');
    const relativeDir = path.relative(parts.join('/'), process.cwd());
    const projectDir = path.resolve(path.join(relativeDir, parts.join('/')));
    bnd
      .getWebContextPath(projectDir)
      .then(webContextPath => {
        let resourcesPath = `${projectDir}/classes/META-INF/resources`;
        fs.stat(resourcesPath, error => {
          if (error) {
            resourcesPath = `${projectDir}/build/resources/main/META-INF/resources`;
          }
          fs.stat(resourcesPath, error => {
            if (error) {
              log.error(
                'javascript-dependencies',
                `You need to build ${projectDir} first.`
              );
              reject(error);
              return;
            }
            const targetName = `node_modules${webContextPath}`;
            fs.copy(resourcesPath, targetName, error => {
              if (error) {
                reject(error);
              } else {
                resolve(targetName);
              }
            });
          });
        });
      })
      .catch(reject);
  });
};

module.exports = () => {
  return new Promise((resolve, reject) => {
    if (global.jsDeps) {
      resolve(global.jsDeps);
    } else {
      fs.stat('build.gradle', error => {
        if (error) {
          resolve([]);
        } else {
          let jsDeps = gradle
            .dependencies('jsCompile')
            .map(depLine => copyJsDependency(depLine));
          Promise.all(jsDeps)
            .then(dependencies => {
              global.jsDeps = dependencies;
              resolve(dependencies);
            })
            .catch(reject);
        }
      });
    }
  });
};
