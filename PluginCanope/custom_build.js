const gulp = require('gulp');

function moveCanopeFiles() {
	return new Promise((resolve, reject) => {
		console.log(__dirname);
		gulp.src(`${__dirname}/extra_files/*`).pipe(gulp.dest(`${__dirname}/../../classroom/`)).on('finish', () => {
			resolve();
		});
	});
}

moveCanopeFiles();