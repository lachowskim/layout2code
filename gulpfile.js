const gulp = require('gulp');
const { src, dest, watch, series, parallel } = require('gulp');
const dartSass = require('sass');// Import gulp-dart-sass
const sass = require('gulp-sass')(require('sass'));
const prefix = require('autoprefixer');
const terser = require('gulp-terser');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const nunjucksRender = require('gulp-nunjucks-render');
const config = require('./gulp.config.json');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename'); 

var error = function (err) {
    console.log(err);
}

//scss
function scssTask() {
    return src('src/scss/main.scss') // Replace with your main SCSS file
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError)) // Use `sass` instead of `gulpSass`
        .pipe(postcss([prefix()]))
        .pipe(rename('style.css')) // Rename output file to style.css
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist')); // Output folder
}

//js 
function jsTask() {
    return src('src/js/script.js')
        .pipe(sourcemaps.init())
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/js'));
}

//nunjucks
function nunjucksTask() {
    return src('src/pages/*.html')
        .pipe(nunjucksRender({
            path: ['src/templates']
        }))
        .pipe(dest('dist'));
}

//watchTask
function watchTask() {
    watch('src/scss/**/*.scss', scssTask);
    watch('src/js/script.js', jsTask);
    watch(['src/pages/*.html', 'src/templates/*.html'], nunjucksTask);
}

//default gulp
exports.default = series(parallel(nunjucksTask, scssTask, jsTask), watchTask);
