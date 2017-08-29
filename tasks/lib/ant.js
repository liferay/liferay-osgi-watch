'use strict';

const childProcess = require('child_process');

const getAntChildProcess = args => {
	const cwd = process.cwd();

	return childProcess.spawn('ant', args, { cwd });
};

module.exports = args => {
	return new Promise((resolve, reject) => {
		const cp = getAntChildProcess(args);
		let antOutput = '';
		cp.stdout.on('data', data => {
			antOutput += data.toString();
		});
		cp.stderr.pipe(process.stderr);
		cp.on('exit', code => {
			if (code === 0) {
				resolve(antOutput);
			} else {
				reject(new Error('Unable to call ant ' + args.join(' ')));
			}
		});
	});
};