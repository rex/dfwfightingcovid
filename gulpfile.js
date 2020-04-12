const { series, parallel, src, dest, watch } = require('gulp');
const { exec } = require('child_process');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const fs = require('fs');
const path = require('path');

const content = require('./content.json');

sass.compiler = require('node-sass');

function clean() {
  return exec("find dist -type f -not -name '.*' -print -delete");
}

function compileHTML() {
  // nunjucksRender.nunjucks.configure(['src/html/pages/templates/']);
  return src('src/html/pages/*.+(html|nunjucks)')
    .pipe(data(content))
    .pipe(nunjucksRender({
      path: ['src/html/pages/templates/']
    }))
    .pipe(dest('./dist'));
}

function compileSASS() {
  return src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed', sourceMap: true }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(dest('./dist'));
}

function placeAssets() {
  return exec('cp -r src/images dist');
}

function placeFavicon() {
  return exec('cp favicon.ico dist');
}

function placeTransparencyDocs() {
  return exec('cp -r transparency-docs dist');
}

function watchHTML() {
  return watch('./src/html/**/*', compileHTML);
}

function watchSASS() {
  return watch('./src/scss/**/*.scss', compileSASS);
}

exports.assets = parallel(placeAssets, placeFavicon);
exports.build = series(clean, parallel(compileHTML, compileSASS, placeAssets));
exports.default = series(clean, parallel(compileHTML, compileSASS, placeAssets, placeFavicon, placeTransparencyDocs), parallel(watchSASS, watchHTML));
