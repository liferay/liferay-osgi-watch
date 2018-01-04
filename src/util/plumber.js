const log = require('./log');
const gulpPlumber = require('gulp-plumber');

/**
 * @param {String} source
 * @return {gulpPlumber}
 */
export function plumb(source) {
  return gulpPlumber({
    errorHandler: function(err) {
      log.error(source, err);
      this.emit('end');
    },
  });
}
