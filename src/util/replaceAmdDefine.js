'use strict';

const configs = require('./configs');
const log = require('./log');
const path = require('path');
const tap = require('gulp-tap');
const readJson = require('read-package-json');

let moduleName = '';
let moduleVersion = '';
readJson(
  path.join(process.cwd(), 'package.json'),
  console.error,
  false,
  (er, data) => {
    if (er) {
      log.warn(
        'replaceAmdDefine',
        'No package.json file found (AMD defines -if used- will not ' +
          'contain package name and version)'
      );
      return;
    }
    moduleName = data.name;
    moduleVersion = data.version;
  }
);

module.exports = () =>
  tap(file => {
    const cfg = configs.builders['javascript-es6'].config;
    let resourcesPath = path.relative(
      process.cwd(),
      file.path.replace(configs.pathExploded + '/META-INF/resources', '')
    );
    const defineEndsWithJs = cfg.defineEndsWithJs;
    const keepExtension = defineEndsWithJs.filter(item => {
      return resourcesPath.endsWith(item);
    });
    if (keepExtension.length === 0) {
      resourcesPath = resourcesPath.replace('.js', '');
    }
    file.contents = new Buffer(
      String(file.contents).replace(
        /define\(\[/g,
        'Liferay.Loader.define("' +
          moduleName +
          '@' +
          moduleVersion +
          '/' +
          resourcesPath +
          '", ['
      )
    );
  });
