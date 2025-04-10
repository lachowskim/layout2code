"use strict";

var gulp = require('gulp');

var _require = require('gulp'),
    src = _require.src,
    dest = _require.dest,
    watch = _require.watch,
    series = _require.series,
    parallel = _require.parallel;

var dartSass = require('sass'); // Import gulp-dart-sass


var sass = require('gulp-sass')(require('sass'));

var prefix = require('autoprefixer');

var terser = require('gulp-terser');

var postcss = require('gulp-postcss');

var concat = require('gulp-concat');

var nunjucksRender = require('gulp-nunjucks-render');

var config = require('./gulp.config.json');

var sourcemaps = require('gulp-sourcemaps');

var rename = require('gulp-rename');

var error = function error(err) {
  console.log(err);
}; //scss


function scssTask() {
  return src('src/scss/main.scss') // Replace with your main SCSS file
  .pipe(sourcemaps.init()).pipe(sass({
    outputStyle: 'expanded'
  }).on('error', sass.logError)) // Use `sass` instead of `gulpSass`
  .pipe(postcss([prefix()])).pipe(rename('style.css')) // Rename output file to style.css
  .pipe(sourcemaps.write('.')).pipe(dest('dist')); // Output folder
} //js 


function jsTask() {
  return src('src/js/script.js').pipe(sourcemaps.init()).pipe(terser()).pipe(sourcemaps.write('.')).pipe(dest('dist/js'));
} //nunjucks


function nunjucksTask() {
  return src('src/pages/*.html').pipe(nunjucksRender({
    path: ['src/templates']
  })).pipe(dest('dist'));
} //watchTask


function watchTask() {
  watch('src/scss/**/*.scss', scssTask);
  watch('src/js/script.js', jsTask);
  watch(['src/pages/*.html', 'src/templates/*.html'], nunjucksTask);
} //default gulp


exports["default"] = series(parallel(nunjucksTask, scssTask, jsTask), watchTask);