const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

gulp.task('default', () => {
    nodemon({
            script: './app.js',
            ext: '.js',
            env: {
                PORT: 9000,
            },
            ignore: ['./node_modules/**', './src/**'],
        })
        .on('restart', () => {
            console.log('Restarting app');
        });
});