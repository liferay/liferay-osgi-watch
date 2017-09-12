'use strict';

const ant = require('../util/ant');
const configs = require('../util/configs');
const fs = require('fs');
const gradle = require('../util/gradle');
const gulp = require('gulp');
const log = require('../util/log');
const projectDeps = require('../util/projectDeps');

const buildGradleArgs = projects => {
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
	projects.forEach(project =>
		skippedTasks.forEach(task => {
			args.push('-x');
			args.push(project + ':' + task);
		}),
	);
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

	projectDeps().then(projects => {
		let compileResult = fs.existsSync('build.gradle')
			? gradle(buildGradleArgs(projects))
			: ant(['compile']);

		compileResult.then(
			compileOutput => {
				gulp
					.src(cfg.config.outputGlob)
					.pipe(gulp.dest(configs.pathExploded))
					.on('end', () => {
						log.duration('build-java', start);
						done();
					});
			},
			compileError => {
				log.error(
					'build-java',
					'Java classes could not be compiled (👆👆 check compiler output 👆👆)',
				);
				done();
			},
		);
	});
});
