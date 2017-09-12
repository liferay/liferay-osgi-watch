const gutil = require('gulp-util');
const pretty = require('pretty-hrtime');

/**
 * @param {String} source
 * @param {String} messages
 * @return {void}
 */
export function info(source, ...messages) {
	log({ fg: 'magenta' }, source, ...messages);
}

/**
 * @param {String} source
 * @param {number} start
 * @return {void}
 */
export function duration(source, start) {
	const duration = pretty(process.hrtime(start));

	log({ fg: 'green' }, source, `took: ${duration}`);
}

/**
 * @param {String} source
 * @param {String} messages
 * @return {void}
 */
export function warn(source, ...messages) {
	log({ fg: 'white', bg: 'yellow' }, source, 'WARNING:', ...messages);
}

/**
 * @param {String} source
 * @param {Object} error
 * @return {void}
 */
export function error(source, error) {
	if (error.message) {
		error = error.message;
	}

	log({ fg: 'white', bg: 'red' }, source, 'ERROR:', error);
}

/**
 * @param {String} sourceColor
 * @param {String} source
 * @param {String} color
 * @param {String} messages
 * @return {void}
 */
function log({ fg = null, bg = null } = {}, source, ...messages) {
	if (fg) {
		source = gutil.colors[fg](source);
	}
	if (bg) {
		source = gutil.colors[`bg${bg[0].toUpperCase()}${bg.substr(1)}`](
			source,
		);
	}

	gutil.log(source, ...messages);
}
